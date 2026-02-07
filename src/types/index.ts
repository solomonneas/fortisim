/**
 * FortiSim Type Definitions
 * Models FortiOS REST API response structures
 */

/** FortiOS interface/zone reference used in policies */
export interface InterfaceRef {
  name: string;
  q_origin_key: string;
}

/** FortiOS address object reference used in policies */
export interface AddressRef {
  name: string;
  q_origin_key: string;
}

/** FortiOS service reference used in policies */
export interface ServiceRef {
  name: string;
  q_origin_key: string;
}

/** FortiOS Firewall Policy — mirrors /api/v2/cmdb/firewall/policy */
export interface FirewallPolicy {
  policyid: number;
  name: string;
  uuid: string;
  srcintf: InterfaceRef[];
  dstintf: InterfaceRef[];
  srcaddr: AddressRef[];
  dstaddr: AddressRef[];
  service: ServiceRef[];
  action: 'accept' | 'deny';
  schedule: string;
  logtraffic: 'all' | 'utm' | 'disable';
  status: 'enable' | 'disable';
  nat: 'enable' | 'disable';
  comments: string;
  /** Accumulated hit count */
  hit_count: number;
  /** Total bytes processed */
  bytes: number;
  /** Active session count */
  session_count: number;
  /** Last used timestamp (epoch) */
  last_used: number;
}

/** FortiOS Address Object — mirrors /api/v2/cmdb/firewall/address */
export interface Address {
  name: string;
  uuid: string;
  type: 'ipmask' | 'fqdn' | 'iprange' | 'wildcard';
  subnet: string;
  /** Start IP for iprange type */
  start_ip?: string;
  /** End IP for iprange type */
  end_ip?: string;
  /** FQDN for fqdn type */
  fqdn?: string;
  associated_interface: string;
  comment: string;
  color: number;
}

/** FortiOS Service Object — mirrors /api/v2/cmdb/firewall.service/custom */
export interface Service {
  name: string;
  uuid: string;
  protocol: 'TCP/UDP/SCTP' | 'ICMP' | 'IP';
  tcp_portrange: string;
  udp_portrange: string;
  /** Protocol number for IP type */
  protocol_number?: number;
  comment: string;
  category: string;
  color: number;
}

/** FortiOS Interface — mirrors /api/v2/cmdb/system/interface */
export interface Interface {
  name: string;
  ip: string;
  vdom: string;
  type: 'physical' | 'vlan' | 'tunnel' | 'aggregate' | 'loopback';
  status: 'up' | 'down';
  alias: string;
  /** Zone this interface belongs to */
  zone: string;
  /** Speed in Mbps */
  speed: string;
  /** Link status */
  link: 'up' | 'down';
  mtu: number;
}

/** FortiOS Zone — mirrors /api/v2/cmdb/system/zone */
export interface Zone {
  name: string;
  interfaces: InterfaceRef[];
  description: string;
  color: string;
}

/** FortiOS VIP (Virtual IP / DNAT) — mirrors /api/v2/cmdb/firewall/vip */
export interface VIPRule {
  name: string;
  uuid: string;
  extip: string;
  extintf: string;
  mappedip: string;
  extport: string;
  mappedport: string;
  protocol: 'tcp' | 'udp' | 'sctp' | 'icmp';
  comment: string;
  status: 'enable' | 'disable';
  /** Associated policy id */
  associated_policy: number;
  hit_count: number;
  bytes: number;
}

/** FortiOS IP Pool (SNAT) — mirrors /api/v2/cmdb/firewall/ippool */
export interface SNATPool {
  name: string;
  uuid: string;
  type: 'overload' | 'one-to-one' | 'fixed-port-range';
  startip: string;
  endip: string;
  source_startip: string;
  source_endip: string;
  associated_interface: string;
  comments: string;
  /** Associated policy ids */
  associated_policies: number[];
  hit_count: number;
  bytes: number;
}

/** Combined NAT Rule type */
export type NATRule = VIPRule | SNATPool;

/** Simulated packet for traffic simulator */
export interface SimulatedPacket {
  srcIp: string;
  srcZone: string;
  dstIp: string;
  dstZone: string;
  dstPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
}

/** Policy evaluation step result */
export interface EvaluationStep {
  policyId: number;
  policyName: string;
  checks: {
    srcZone: boolean;
    dstZone: boolean;
    srcAddr: boolean;
    dstAddr: boolean;
    service: boolean;
  };
  matched: boolean;
  action?: 'accept' | 'deny';
  /** Readable explanation */
  detail: string;
}

/** Full simulation result */
export interface SimulationResult {
  packet: SimulatedPacket;
  steps: EvaluationStep[];
  matchedPolicy: FirewallPolicy | null;
  finalAction: 'ALLOW' | 'DENY';
  natApplied: boolean;
  natDetail?: {
    originalSrc: string;
    originalDst: string;
    translatedSrc: string;
    translatedDst: string;
    type: 'SNAT' | 'DNAT';
  };
  timestamp: number;
}

/** Policy conflict types */
export type ConflictType = 'shadow' | 'conflict' | 'redundant';

/** Policy conflict detection result */
export interface PolicyConflict {
  policyId: number;
  conflictsWith: number;
  type: ConflictType;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

/** Dashboard statistics */
export interface DashboardStats {
  totalPolicies: number;
  enabledPolicies: number;
  disabledPolicies: number;
  totalHits: number;
  totalBytes: number;
  unusedPolicies: number;
  conflictCount: number;
  shadowCount: number;
  topPolicies: FirewallPolicy[];
}

/** Firewall device info for status bar */
export interface DeviceInfo {
  hostname: string;
  firmware: string;
  haStatus: string;
  uptime: string;
  serial: string;
  vdom: string;
  cpuUsage: number;
  memUsage: number;
  sessionCount: number;
}
