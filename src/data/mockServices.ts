import type { Service } from '../types';

/** Mock service objects matching FortiOS /api/v2/cmdb/firewall.service/custom */
export const mockServices: Service[] = [
  {
    name: 'ALL',
    uuid: 's0000000-0000-0000-0000-000000000001',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '1-65535',
    udp_portrange: '1-65535',
    comment: 'All TCP/UDP services',
    category: 'General',
    color: 0,
  },
  {
    name: 'HTTP',
    uuid: 's0000000-0000-0000-0000-000000000002',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '80',
    udp_portrange: '',
    comment: 'HTTP web traffic',
    category: 'Web Access',
    color: 6,
  },
  {
    name: 'HTTPS',
    uuid: 's0000000-0000-0000-0000-000000000003',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '443',
    udp_portrange: '',
    comment: 'HTTPS encrypted web traffic',
    category: 'Web Access',
    color: 6,
  },
  {
    name: 'DNS',
    uuid: 's0000000-0000-0000-0000-000000000004',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '53',
    udp_portrange: '53',
    comment: 'DNS name resolution',
    category: 'Network Services',
    color: 3,
  },
  {
    name: 'SSH',
    uuid: 's0000000-0000-0000-0000-000000000005',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '22',
    udp_portrange: '',
    comment: 'Secure Shell',
    category: 'Remote Access',
    color: 1,
  },
  {
    name: 'RDP',
    uuid: 's0000000-0000-0000-0000-000000000006',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '3389',
    udp_portrange: '3389',
    comment: 'Remote Desktop Protocol',
    category: 'Remote Access',
    color: 1,
  },
  {
    name: 'SMTP',
    uuid: 's0000000-0000-0000-0000-000000000007',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '25',
    udp_portrange: '',
    comment: 'Simple Mail Transfer',
    category: 'Email',
    color: 17,
  },
  {
    name: 'SMTPS',
    uuid: 's0000000-0000-0000-0000-000000000008',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '465',
    udp_portrange: '',
    comment: 'SMTP over SSL',
    category: 'Email',
    color: 17,
  },
  {
    name: 'IMAP',
    uuid: 's0000000-0000-0000-0000-000000000009',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '143',
    udp_portrange: '',
    comment: 'Internet Message Access Protocol',
    category: 'Email',
    color: 17,
  },
  {
    name: 'IMAPS',
    uuid: 's0000000-0000-0000-0000-000000000010',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '993',
    udp_portrange: '',
    comment: 'IMAP over SSL',
    category: 'Email',
    color: 17,
  },
  {
    name: 'PING',
    uuid: 's0000000-0000-0000-0000-000000000011',
    protocol: 'ICMP',
    tcp_portrange: '',
    udp_portrange: '',
    protocol_number: 1,
    comment: 'ICMP Echo (ping)',
    category: 'Network Services',
    color: 3,
  },
  {
    name: 'FTP',
    uuid: 's0000000-0000-0000-0000-000000000012',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '21',
    udp_portrange: '',
    comment: 'File Transfer Protocol',
    category: 'File Access',
    color: 13,
  },
  {
    name: 'NTP',
    uuid: 's0000000-0000-0000-0000-000000000013',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '',
    udp_portrange: '123',
    comment: 'Network Time Protocol',
    category: 'Network Services',
    color: 3,
  },
  {
    name: 'LDAP',
    uuid: 's0000000-0000-0000-0000-000000000014',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '389',
    udp_portrange: '389',
    comment: 'Lightweight Directory Access',
    category: 'Authentication',
    color: 9,
  },
  {
    name: 'LDAPS',
    uuid: 's0000000-0000-0000-0000-000000000015',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '636',
    udp_portrange: '',
    comment: 'LDAP over SSL',
    category: 'Authentication',
    color: 9,
  },
  {
    name: 'MS-SQL',
    uuid: 's0000000-0000-0000-0000-000000000016',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '1433',
    udp_portrange: '',
    comment: 'Microsoft SQL Server',
    category: 'Database',
    color: 22,
  },
  {
    name: 'SYSLOG',
    uuid: 's0000000-0000-0000-0000-000000000017',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '',
    udp_portrange: '514',
    comment: 'Syslog logging',
    category: 'Network Services',
    color: 3,
  },
  {
    name: 'SNMP',
    uuid: 's0000000-0000-0000-0000-000000000018',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '',
    udp_portrange: '161',
    comment: 'SNMP monitoring',
    category: 'Network Services',
    color: 3,
  },
  {
    name: 'WEBAPPS',
    uuid: 's0000000-0000-0000-0000-000000000019',
    protocol: 'TCP/UDP/SCTP',
    tcp_portrange: '80 443 8080 8443',
    udp_portrange: '',
    comment: 'Web application ports',
    category: 'Web Access',
    color: 6,
  },
];

/** Parse a port range string like "80" or "80 443" or "1-65535" into an array of [start, end] tuples */
export function parsePortRange(portRange: string): Array<[number, number]> {
  if (!portRange || portRange.trim() === '') return [];
  return portRange.split(/\s+/).map((seg) => {
    if (seg.includes('-')) {
      const [start, end] = seg.split('-').map(Number);
      return [start, end] as [number, number];
    }
    const port = Number(seg);
    return [port, port] as [number, number];
  });
}

/** Check if a given port number falls within any range defined by the service */
export function serviceMatchesPort(
  service: Service,
  port: number,
  protocol: 'TCP' | 'UDP' | 'ICMP'
): boolean {
  if (service.name === 'ALL') return true;

  if (protocol === 'ICMP') {
    return service.protocol === 'ICMP';
  }

  const ranges =
    protocol === 'TCP'
      ? parsePortRange(service.tcp_portrange)
      : parsePortRange(service.udp_portrange);

  return ranges.some(([start, end]) => port >= start && port <= end);
}
