/**
 * Policy Conflict & Shadow Detector
 * Analyzes the policy table for:
 * - Shadowed rules: a broader rule above makes this rule unreachable
 * - Conflicts: overlapping criteria with different actions
 * - Redundant: duplicate match with same action (wasted rule)
 */
import type { FirewallPolicy, PolicyConflict } from '../types';
import { mockAddresses } from '../data/mockAddresses';
import { mockServices, parsePortRange } from '../data/mockServices';

/**
 * Parse FortiOS subnet "10.0.1.0 255.255.255.0" → { network: number, mask: number, cidr: number }
 */
function parseSubnet(addrName: string): { network: number; mask: number; cidr: number } | null {
  if (addrName === 'all') {
    return { network: 0, mask: 0, cidr: 0 };
  }

  const addr = mockAddresses.find((a) => a.name === addrName);
  if (!addr || addr.type !== 'ipmask') return null;

  const parts = addr.subnet.split(' ');
  if (parts.length !== 2) return null;

  const [netStr, maskStr] = parts;
  const network = ipToNum(netStr);
  const mask = ipToNum(maskStr);
  const cidr = mask === 0 ? 0 : maskStr
    .split('.')
    .reduce(
      (acc, o) =>
        acc + (parseInt(o) >>> 0).toString(2).replace(/0/g, '').length,
      0
    );

  return { network, mask, cidr };
}

/**
 * Parse an iprange address object → { startIp: number, endIp: number } or null
 */
function parseIpRange(addrName: string): { startIp: number; endIp: number } | null {
  if (addrName === 'all') return { startIp: 0, endIp: 0xffffffff };

  const addr = mockAddresses.find((a) => a.name === addrName);
  if (!addr) return null;

  if (addr.type === 'iprange' && addr.start_ip && addr.end_ip) {
    return { startIp: ipToNum(addr.start_ip), endIp: ipToNum(addr.end_ip) };
  }

  return null;
}

/**
 * Convert a subnet to an IP range for unified comparison.
 */
function subnetToRange(sub: { network: number; mask: number; cidr: number }): { startIp: number; endIp: number } {
  if (sub.cidr === 0) return { startIp: 0, endIp: 0xffffffff };
  const maskBits = (0xffffffff << (32 - sub.cidr)) >>> 0;
  const start = (sub.network & maskBits) >>> 0;
  const end = (start | (~maskBits >>> 0)) >>> 0;
  return { startIp: start, endIp: end };
}

/**
 * Resolve an address name to an IP range { startIp, endIp }.
 * Handles ipmask, iprange, and 'all'. Returns null for fqdn/unknown.
 *
 * NOTE: FQDN addresses cannot be resolved to IP ranges at analysis time
 * because they depend on DNS resolution. FQDN addresses are skipped in
 * overlap detection, which may cause false negatives (missed conflicts)
 * for policies using FQDN address objects.
 */
function resolveToRange(addrName: string): { startIp: number; endIp: number } | null {
  if (addrName === 'all') return { startIp: 0, endIp: 0xffffffff };

  const addr = mockAddresses.find((a) => a.name === addrName);
  if (!addr) return null;

  if (addr.type === 'ipmask') {
    const sub = parseSubnet(addrName);
    if (!sub) return null;
    return subnetToRange(sub);
  }

  if (addr.type === 'iprange') {
    return parseIpRange(addrName);
  }

  // FQDN — cannot resolve statically, see NOTE above
  if (addr.type === 'fqdn') return null;

  return null;
}

function ipToNum(ip: string): number {
  const p = ip.split('.').map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

/**
 * Check if range A fully contains range B
 */
function rangeContains(
  a: { startIp: number; endIp: number },
  b: { startIp: number; endIp: number }
): boolean {
  return a.startIp <= b.startIp && a.endIp >= b.endIp;
}

/**
 * Check if two IP ranges overlap at all
 */
function rangesOverlap(
  a: { startIp: number; endIp: number },
  b: { startIp: number; endIp: number }
): boolean {
  return a.startIp <= b.endIp && b.startIp <= a.endIp;
}

/**
 * Check if subnet A is a superset of (or equal to) subnet B
 * i.e., everything in B is also in A
 */
function isSuperset(a: { network: number; mask: number; cidr: number }, b: { network: number; mask: number; cidr: number }): boolean {
  // A with /0 covers everything
  if (a.cidr === 0) return true;
  // If A has a larger prefix (smaller range), it can't be a superset of B
  if (a.cidr > b.cidr) return false;
  // Check that B's network falls within A's range
  const aMask = a.cidr === 0 ? 0 : (0xffffffff << (32 - a.cidr)) >>> 0;
  return (b.network & aMask) === (a.network & aMask);
}

/**
 * Check if two policies have overlapping interfaces
 */
function interfacesOverlap(
  a: { name: string }[],
  b: { name: string }[]
): boolean {
  if (a.some((i) => i.name === 'any') || b.some((i) => i.name === 'any')) return true;
  return a.some((ai) => b.some((bi) => ai.name === bi.name));
}

/**
 * Check if policy A's address set is a superset of policy B's address set.
 * Supports ipmask and iprange address types via unified range comparison.
 */
function addressIsSupersetOf(
  aAddrs: { name: string }[],
  bAddrs: { name: string }[]
): boolean {
  // If A has "all", it's always a superset
  if (aAddrs.some((a) => a.name === 'all')) return true;

  // Each address in B must be covered by some address in A
  for (const bRef of bAddrs) {
    const bRange = resolveToRange(bRef.name);
    if (!bRange) continue; // Skip FQDN/unknown (can't determine coverage)

    let covered = false;
    for (const aRef of aAddrs) {
      const aRange = resolveToRange(aRef.name);
      if (!aRange) continue;
      if (rangeContains(aRange, bRange)) {
        covered = true;
        break;
      }
    }
    if (!covered) return false;
  }
  return true;
}

/**
 * Resolve a service name to its port ranges for a given protocol.
 * Returns arrays of [start, end] tuples for TCP and UDP.
 */
function resolveServicePorts(svcName: string): {
  tcp: Array<[number, number]>;
  udp: Array<[number, number]>;
  isAll: boolean;
  isIcmp: boolean;
} {
  if (svcName === 'ALL') {
    return { tcp: [[1, 65535]], udp: [[1, 65535]], isAll: true, isIcmp: true };
  }
  const svc = mockServices.find((s) => s.name === svcName);
  if (!svc) return { tcp: [], udp: [], isAll: false, isIcmp: false };
  return {
    tcp: parsePortRange(svc.tcp_portrange),
    udp: parsePortRange(svc.udp_portrange),
    isAll: false,
    isIcmp: svc.protocol === 'ICMP',
  };
}

/**
 * Check if port range A contains port range B
 */
function portRangeContains(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[0] && a[1] >= b[1];
}

/**
 * Check if two port ranges overlap
 */
function portRangesOverlap(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

/**
 * Check if policy A's service set is a superset of policy B's service set.
 * Compares by port/protocol ranges when available, not just name equality.
 */
function serviceIsSupersetOf(
  aServices: { name: string }[],
  bServices: { name: string }[]
): boolean {
  if (aServices.some((s) => s.name === 'ALL')) return true;

  // Resolve A's services into combined port ranges
  const aPorts = { tcp: [] as Array<[number, number]>, udp: [] as Array<[number, number]>, icmp: false };
  for (const aSvc of aServices) {
    const resolved = resolveServicePorts(aSvc.name);
    if (resolved.isAll) return true;
    aPorts.tcp.push(...resolved.tcp);
    aPorts.udp.push(...resolved.udp);
    if (resolved.isIcmp) aPorts.icmp = true;
  }

  // Check that each B service's ports are covered by A
  for (const bSvc of bServices) {
    if (bSvc.name === 'ALL') return false; // B is broader
    const bResolved = resolveServicePorts(bSvc.name);
    if (bResolved.isAll) return false;

    // Check ICMP
    if (bResolved.isIcmp && !aPorts.icmp) return false;

    // Check TCP ports
    for (const bRange of bResolved.tcp) {
      const covered = aPorts.tcp.some((aRange) => portRangeContains(aRange, bRange));
      if (!covered) return false;
    }

    // Check UDP ports
    for (const bRange of bResolved.udp) {
      const covered = aPorts.udp.some((aRange) => portRangeContains(aRange, bRange));
      if (!covered) return false;
    }
  }
  return true;
}

/**
 * Check if two policies have overlapping match criteria
 */
function policiesOverlap(above: FirewallPolicy, below: FirewallPolicy): boolean {
  return (
    interfacesOverlap(above.srcintf, below.srcintf) &&
    interfacesOverlap(above.dstintf, below.dstintf) &&
    addressesOverlap(above.srcaddr, below.srcaddr) &&
    addressesOverlap(above.dstaddr, below.dstaddr) &&
    servicesOverlap(above.service, below.service)
  );
}

/**
 * Check if two address lists have any overlapping IP ranges.
 * Handles ipmask, iprange, and 'all' address types.
 */
function addressesOverlap(
  a: { name: string }[],
  b: { name: string }[]
): boolean {
  // If either has "all", they overlap
  if (a.some((x) => x.name === 'all') || b.some((x) => x.name === 'all')) return true;

  // Check if any pair of addresses overlap using unified range comparison
  for (const aRef of a) {
    const aRange = resolveToRange(aRef.name);
    if (!aRange) continue;
    for (const bRef of b) {
      const bRange = resolveToRange(bRef.name);
      if (!bRange) continue;
      if (rangesOverlap(aRange, bRange)) return true;
    }
  }
  return false;
}

/**
 * Check if two service lists have overlapping ports.
 * Compares by port/protocol ranges when available.
 */
function servicesOverlap(
  a: { name: string }[],
  b: { name: string }[]
): boolean {
  if (a.some((s) => s.name === 'ALL') || b.some((s) => s.name === 'ALL')) return true;

  // Resolve all port ranges and check for overlaps
  for (const aSvc of a) {
    const aResolved = resolveServicePorts(aSvc.name);
    for (const bSvc of b) {
      const bResolved = resolveServicePorts(bSvc.name);

      // ICMP overlap
      if (aResolved.isIcmp && bResolved.isIcmp) return true;

      // TCP port overlap
      for (const aRange of aResolved.tcp) {
        for (const bRange of bResolved.tcp) {
          if (portRangesOverlap(aRange, bRange)) return true;
        }
      }

      // UDP port overlap
      for (const aRange of aResolved.udp) {
        for (const bRange of bResolved.udp) {
          if (portRangesOverlap(aRange, bRange)) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect all conflicts and shadows in a policy list
 */
export function detectConflicts(policies: FirewallPolicy[]): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];
  const enabledPolicies = policies.filter((p) => p.status === 'enable' && p.policyid !== 0);

  for (let i = 0; i < enabledPolicies.length; i++) {
    const below = enabledPolicies[i];

    for (let j = 0; j < i; j++) {
      const above = enabledPolicies[j];

      // Check if the policy above fully shadows the one below
      const aboveIsSupersetSrc = addressIsSupersetOf(above.srcaddr, below.srcaddr);
      const aboveIsSupersetDst = addressIsSupersetOf(above.dstaddr, below.dstaddr);
      const aboveIsSupersetSvc = serviceIsSupersetOf(above.service, below.service);
      const intfOverlap =
        interfacesOverlap(above.srcintf, below.srcintf) &&
        interfacesOverlap(above.dstintf, below.dstintf);

      if (intfOverlap && aboveIsSupersetSrc && aboveIsSupersetDst && aboveIsSupersetSvc) {
        if (above.action === below.action) {
          // Redundant: same action, below is fully shadowed
          conflicts.push({
            policyId: below.policyid,
            conflictsWith: above.policyid,
            type: 'shadow',
            severity: 'medium',
            description: `Shadowed by Policy ${above.policyid} (${above.name}): broader match with same action '${above.action}'`,
          });
        } else {
          // True conflict: broader rule above has different action
          conflicts.push({
            policyId: below.policyid,
            conflictsWith: above.policyid,
            type: 'conflict',
            severity: 'high',
            description: `Conflicted with Policy ${above.policyid} (${above.name}): broader match but different action (${above.action} vs ${below.action})`,
          });
        }
        // Don't break — continue checking for additional conflicts with other policies
        continue;
      }

      // Check for partial overlap with different actions
      if (policiesOverlap(above, below) && above.action !== below.action) {
        // Check if this specific pair is already reported
        if (!conflicts.some((c) => c.policyId === below.policyid && c.conflictsWith === above.policyid)) {
          conflicts.push({
            policyId: below.policyid,
            conflictsWith: above.policyid,
            type: 'conflict',
            severity: 'medium',
            description: `Partial overlap with Policy ${above.policyid} (${above.name}): overlapping criteria with different action (${above.action} vs ${below.action})`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Get unused policies (hit_count === 0 and enabled)
 */
export function findUnusedPolicies(policies: FirewallPolicy[]): FirewallPolicy[] {
  return policies.filter(
    (p) => p.status === 'enable' && p.hit_count === 0 && p.policyid !== 0
  );
}
