/**
 * Policy Evaluator — simulates FortiGate first-match-wins firewall logic
 * Evaluates a simulated packet against the policy table top-to-bottom
 */
import type {
  FirewallPolicy,
  SimulatedPacket,
  EvaluationStep,
  SimulationResult,
} from '../types';
import { mockAddresses } from '../data/mockAddresses';
import { mockServices, serviceMatchesPort } from '../data/mockServices';
import { mockInterfaces, mockZones } from '../data/mockInterfaces';
import { mockVIPRules } from '../data/mockNATRules';

/**
 * Canonical interface→zone mapping built from mockInterfaces data.
 * Single source of truth for resolving between interfaces and zones.
 */
const interfaceToZone = new Map<string, string>(
  mockInterfaces.map((i) => [i.name, i.zone])
);

/** Reverse mapping: zone→interface names */
const zoneToInterfaces = new Map<string, string[]>(
  mockZones.map((z) => [z.name, z.interfaces.map((i) => i.name)])
);

/**
 * Resolve a name (interface or zone) to its canonical zone name.
 * Returns the zone if it's already a zone name, or looks up the interface's zone.
 */
function resolveZone(name: string): string | null {
  if (name === 'any') return 'any';
  // Already a zone name?
  if (zoneToInterfaces.has(name)) return name;
  // Interface name → look up its zone
  return interfaceToZone.get(name) ?? null;
}

/**
 * Parse a subnet mask like "255.255.255.0" into CIDR prefix length
 */
function maskToCidr(mask: string): number {
  return mask
    .split('.')
    .reduce(
      (acc, octet) =>
        acc + (parseInt(octet) >>> 0).toString(2).replace(/0/g, '').length,
      0
    );
}

/**
 * Convert IP string to 32-bit number for range comparisons
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Check if an IP address falls within a subnet (FortiOS "ip mask" format: "10.0.1.0 255.255.255.0")
 */
function ipInSubnet(ip: string, subnet: string): boolean {
  const parts = subnet.split(' ');
  if (parts.length !== 2) return false;

  const [network, mask] = parts;

  // "0.0.0.0 0.0.0.0" matches everything (like "all")
  if (network === '0.0.0.0' && mask === '0.0.0.0') return true;

  const cidr = maskToCidr(mask);
  const ipNum = ipToNumber(ip);
  const netNum = ipToNumber(network);
  const maskBits = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;

  return (ipNum & maskBits) === (netNum & maskBits);
}

/**
 * Check if an IP matches a FortiOS address object by name
 */
function ipMatchesAddress(ip: string, addrName: string): boolean {
  if (addrName === 'all') return true;

  const addr = mockAddresses.find((a) => a.name === addrName);
  if (!addr) return false;

  if (addr.type === 'ipmask') {
    return ipInSubnet(ip, addr.subnet);
  }

  if (addr.type === 'iprange' && addr.start_ip && addr.end_ip) {
    const ipNum = ipToNumber(ip);
    return ipNum >= ipToNumber(addr.start_ip) && ipNum <= ipToNumber(addr.end_ip);
  }

  // FQDN — can't resolve in simulation, skip
  if (addr.type === 'fqdn') return false;

  return false;
}

/**
 * Check if a packet's zone/interface matches a policy's interface list.
 * Both the packet field and policy field can be either interface names or zone names.
 * We resolve both sides to canonical zone names and compare.
 */
function zoneMatchesInterface(
  zone: string,
  policyInterfaces: { name: string }[]
): boolean {
  // "any" on either side matches everything
  if (zone === 'any') return true;
  if (policyInterfaces.some((i) => i.name === 'any')) return true;

  // Resolve the packet's zone/interface to a canonical zone name
  const packetZone = resolveZone(zone);

  for (const pi of policyInterfaces) {
    // Resolve each policy interface to its canonical zone name
    const policyZone = resolveZone(pi.name);

    // If both resolve to the same zone, it's a match
    if (packetZone && policyZone && packetZone === policyZone) return true;

    // Direct name match as fallback (handles edge cases)
    if (pi.name === zone) return true;
  }

  return false;
}

/**
 * Check if port/protocol matches a policy's service list
 */
function serviceMatches(
  port: number,
  protocol: 'TCP' | 'UDP' | 'ICMP',
  policyServices: { name: string }[]
): boolean {
  for (const svcRef of policyServices) {
    if (svcRef.name === 'ALL') return true;

    const svc = mockServices.find((s) => s.name === svcRef.name);
    if (svc && serviceMatchesPort(svc, port, protocol)) return true;
  }
  return false;
}

/**
 * Evaluate a single policy against a packet, returning a detailed step
 */
function evaluatePolicy(
  policy: FirewallPolicy,
  packet: SimulatedPacket
): EvaluationStep {
  const srcZoneMatch = zoneMatchesInterface(packet.srcZone, policy.srcintf);
  const dstZoneMatch = zoneMatchesInterface(packet.dstZone, policy.dstintf);
  const srcAddrMatch = policy.srcaddr.some((a) =>
    ipMatchesAddress(packet.srcIp, a.name)
  );
  const dstAddrMatch = policy.dstaddr.some((a) =>
    ipMatchesAddress(packet.dstIp, a.name)
  );
  const svcMatch = serviceMatches(packet.dstPort, packet.protocol, policy.service);

  const allMatch = srcZoneMatch && dstZoneMatch && srcAddrMatch && dstAddrMatch && svcMatch;

  // Build readable detail string
  const checks = [
    `src_zone=${packet.srcZone} ${srcZoneMatch ? '✓' : '✗'}`,
    `dst_zone=${packet.dstZone} ${dstZoneMatch ? '✓' : '✗'}`,
    `src_addr=${packet.srcIp} ${srcAddrMatch ? '✓' : '✗'}`,
    `dst_addr=${packet.dstIp} ${dstAddrMatch ? '✓' : '✗'}`,
    `service=${packet.protocol}/${packet.dstPort} ${svcMatch ? '✓' : '✗'}`,
  ];

  const detail = allMatch
    ? `Policy ${policy.policyid}: ${checks.join(', ')} → MATCH (${policy.action.toUpperCase()})`
    : `Policy ${policy.policyid}: ${checks.join(', ')} → no match`;

  return {
    policyId: policy.policyid,
    policyName: policy.name,
    checks: {
      srcZone: srcZoneMatch,
      dstZone: dstZoneMatch,
      srcAddr: srcAddrMatch,
      dstAddr: dstAddrMatch,
      service: svcMatch,
    },
    matched: allMatch,
    action: allMatch ? policy.action : undefined,
    detail,
  };
}

/**
 * Check for NAT translation (VIP/DNAT) based on destination IP
 */
function checkNAT(
  packet: SimulatedPacket,
  matchedPolicy: FirewallPolicy | null
): SimulationResult['natDetail'] | undefined {
  if (!matchedPolicy) return undefined;

  // Check for DNAT (inbound VIP)
  for (const vip of mockVIPRules) {
    if (
      vip.status === 'enable' &&
      (ipToNumber(packet.dstIp) === ipToNumber(vip.extip)) &&
      Number(vip.extport) === packet.dstPort
    ) {
      return {
        originalSrc: packet.srcIp,
        originalDst: `${vip.extip}:${vip.extport}`,
        translatedSrc: packet.srcIp,
        translatedDst: `${vip.mappedip}:${vip.mappedport}`,
        type: 'DNAT',
      };
    }
  }

  // Check for SNAT (outbound NAT enabled on policy)
  if (matchedPolicy.nat === 'enable') {
    // Determine outbound interface IP
    const outIntf = matchedPolicy.dstintf[0]?.name;
    const iface = mockInterfaces.find((i) => i.name === outIntf);
    const natIp = iface ? iface.ip.split('/')[0] : '203.0.113.2';

    return {
      originalSrc: packet.srcIp,
      originalDst: `${packet.dstIp}:${packet.dstPort}`,
      translatedSrc: natIp,
      translatedDst: `${packet.dstIp}:${packet.dstPort}`,
      type: 'SNAT',
    };
  }

  return undefined;
}

/**
 * Run full packet simulation against the policy table
 * Returns step-by-step evaluation and final result
 */
export function simulatePacket(
  packet: SimulatedPacket,
  policies: FirewallPolicy[]
): SimulationResult {
  const steps: EvaluationStep[] = [];
  let matchedPolicy: FirewallPolicy | null = null;

  // Evaluate each enabled policy top-to-bottom (first match wins)
  for (const policy of policies) {
    // Skip disabled policies
    if (policy.status === 'disable') continue;

    const step = evaluatePolicy(policy, packet);
    steps.push(step);

    if (step.matched) {
      matchedPolicy = policy;
      break;
    }
  }

  const natDetail = checkNAT(packet, matchedPolicy);

  return {
    packet,
    steps,
    matchedPolicy,
    finalAction: matchedPolicy?.action === 'accept' ? 'ALLOW' : 'DENY',
    natApplied: !!natDetail,
    natDetail,
    timestamp: Date.now(),
  };
}
