/**
 * Policy Conflict & Shadow Detector
 * Analyzes the policy table for:
 * - Shadowed rules: a broader rule above makes this rule unreachable
 * - Conflicts: overlapping criteria with different actions
 * - Redundant: duplicate match with same action (wasted rule)
 */
import type { FirewallPolicy, PolicyConflict } from '../types';
import { mockAddresses } from '../data/mockAddresses';

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

function ipToNum(ip: string): number {
  const p = ip.split('.').map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
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
 * Check if policy A's address set is a superset of policy B's address set
 */
function addressIsSupersetOf(
  aAddrs: { name: string }[],
  bAddrs: { name: string }[]
): boolean {
  // If A has "all", it's always a superset
  if (aAddrs.some((a) => a.name === 'all')) return true;

  // Each address in B must be covered by some address in A
  for (const bRef of bAddrs) {
    const bSub = parseSubnet(bRef.name);
    if (!bSub) continue;

    let covered = false;
    for (const aRef of aAddrs) {
      const aSub = parseSubnet(aRef.name);
      if (!aSub) continue;
      if (isSuperset(aSub, bSub)) {
        covered = true;
        break;
      }
    }
    if (!covered) return false;
  }
  return true;
}

/**
 * Check if policy A's service set is a superset of policy B's service set
 */
function serviceIsSupersetOf(
  aServices: { name: string }[],
  bServices: { name: string }[]
): boolean {
  if (aServices.some((s) => s.name === 'ALL')) return true;

  // Simple name-based check: each B service must exist in A
  for (const bSvc of bServices) {
    if (bSvc.name === 'ALL') return false; // B is broader
    if (!aServices.some((aSvc) => aSvc.name === bSvc.name)) return false;
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

function addressesOverlap(
  a: { name: string }[],
  b: { name: string }[]
): boolean {
  // If either has "all", they overlap
  if (a.some((x) => x.name === 'all') || b.some((x) => x.name === 'all')) return true;

  // Check if any pair of addresses overlap
  for (const aRef of a) {
    const aSub = parseSubnet(aRef.name);
    if (!aSub) continue;
    for (const bRef of b) {
      const bSub = parseSubnet(bRef.name);
      if (!bSub) continue;
      // Two subnets overlap if either is a superset of the other
      if (isSuperset(aSub, bSub) || isSuperset(bSub, aSub)) return true;
    }
  }
  return false;
}

function servicesOverlap(
  a: { name: string }[],
  b: { name: string }[]
): boolean {
  if (a.some((s) => s.name === 'ALL') || b.some((s) => s.name === 'ALL')) return true;
  return a.some((aSvc) => b.some((bSvc) => aSvc.name === bSvc.name));
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
        break; // Only report the first shadow/conflict per policy
      }

      // Check for partial overlap with different actions
      if (policiesOverlap(above, below) && above.action !== below.action) {
        // Only flag if not already flagged
        if (!conflicts.some((c) => c.policyId === below.policyid)) {
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
