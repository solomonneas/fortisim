import type { Address } from '../types';

/** Mock address objects matching FortiOS /api/v2/cmdb/firewall/address */
export const mockAddresses: Address[] = [
  {
    name: 'all',
    uuid: 'a0000000-0000-0000-0000-000000000001',
    type: 'ipmask',
    subnet: '0.0.0.0 0.0.0.0',
    associated_interface: '',
    comment: 'All addresses',
    color: 0,
  },
  {
    name: 'LAN_SUBNET',
    uuid: 'a0000000-0000-0000-0000-000000000002',
    type: 'ipmask',
    subnet: '10.0.1.0 255.255.255.0',
    associated_interface: 'lan',
    comment: 'Corporate LAN subnet',
    color: 6,
  },
  {
    name: 'DMZ_SUBNET',
    uuid: 'a0000000-0000-0000-0000-000000000003',
    type: 'ipmask',
    subnet: '10.0.100.0 255.255.255.0',
    associated_interface: 'dmz',
    comment: 'DMZ server subnet',
    color: 17,
  },
  {
    name: 'GUEST_SUBNET',
    uuid: 'a0000000-0000-0000-0000-000000000004',
    type: 'ipmask',
    subnet: '10.10.0.0 255.255.255.0',
    associated_interface: 'guest-wifi',
    comment: 'Guest WiFi network',
    color: 13,
  },
  {
    name: 'VPN_POOL',
    uuid: 'a0000000-0000-0000-0000-000000000005',
    type: 'ipmask',
    subnet: '172.16.0.0 255.255.255.0',
    associated_interface: 'ssl.root',
    comment: 'SSL VPN address pool',
    color: 3,
  },
  {
    name: 'SRV-WEB-01',
    uuid: 'a0000000-0000-0000-0000-000000000006',
    type: 'ipmask',
    subnet: '10.0.100.10 255.255.255.255',
    associated_interface: 'dmz',
    comment: 'Primary web server',
    color: 17,
  },
  {
    name: 'SRV-MAIL-01',
    uuid: 'a0000000-0000-0000-0000-000000000007',
    type: 'ipmask',
    subnet: '10.0.100.20 255.255.255.255',
    associated_interface: 'dmz',
    comment: 'Mail relay server',
    color: 17,
  },
  {
    name: 'SRV-DB-01',
    uuid: 'a0000000-0000-0000-0000-000000000008',
    type: 'ipmask',
    subnet: '10.0.1.50 255.255.255.255',
    associated_interface: 'lan',
    comment: 'Internal database server',
    color: 6,
  },
  {
    name: 'SRV-DC-01',
    uuid: 'a0000000-0000-0000-0000-000000000009',
    type: 'ipmask',
    subnet: '10.0.1.10 255.255.255.255',
    associated_interface: 'lan',
    comment: 'Domain controller',
    color: 6,
  },
  {
    name: 'SRV-DC-02',
    uuid: 'a0000000-0000-0000-0000-000000000010',
    type: 'ipmask',
    subnet: '10.0.1.11 255.255.255.255',
    associated_interface: 'lan',
    comment: 'Secondary domain controller',
    color: 6,
  },
  {
    name: 'MGMT_HOSTS',
    uuid: 'a0000000-0000-0000-0000-000000000011',
    type: 'iprange',
    subnet: '',
    start_ip: '10.0.1.200',
    end_ip: '10.0.1.210',
    associated_interface: 'lan',
    comment: 'IT management workstations',
    color: 1,
  },
  {
    name: 'GOOGLE_DNS',
    uuid: 'a0000000-0000-0000-0000-000000000012',
    type: 'ipmask',
    subnet: '8.8.8.8 255.255.255.255',
    associated_interface: '',
    comment: 'Google public DNS',
    color: 0,
  },
  {
    name: 'CLOUDFLARE_DNS',
    uuid: 'a0000000-0000-0000-0000-000000000013',
    type: 'ipmask',
    subnet: '1.1.1.1 255.255.255.255',
    associated_interface: '',
    comment: 'Cloudflare public DNS',
    color: 0,
  },
  {
    name: 'RFC1918_10',
    uuid: 'a0000000-0000-0000-0000-000000000014',
    type: 'ipmask',
    subnet: '10.0.0.0 255.0.0.0',
    associated_interface: '',
    comment: 'RFC1918 10.x.x.x block',
    color: 0,
  },
  {
    name: 'VIP-WEB-PUBLIC',
    uuid: 'a0000000-0000-0000-0000-000000000015',
    type: 'ipmask',
    subnet: '203.0.113.10 255.255.255.255',
    associated_interface: 'wan1',
    comment: 'Public VIP for web server',
    color: 22,
  },
  {
    name: 'VIP-MAIL-PUBLIC',
    uuid: 'a0000000-0000-0000-0000-000000000016',
    type: 'ipmask',
    subnet: '203.0.113.11 255.255.255.255',
    associated_interface: 'wan1',
    comment: 'Public VIP for mail server',
    color: 22,
  },
  {
    name: 'EXTERNAL_PARTNER',
    uuid: 'a0000000-0000-0000-0000-000000000017',
    type: 'ipmask',
    subnet: '198.51.100.100 255.255.255.255',
    associated_interface: '',
    comment: 'Partner VPN endpoint',
    color: 0,
  },
  {
    name: 'SRV-APP-01',
    uuid: 'a0000000-0000-0000-0000-000000000018',
    type: 'ipmask',
    subnet: '10.0.1.30 255.255.255.255',
    associated_interface: 'lan',
    comment: 'Internal application server',
    color: 6,
  },
  {
    name: 'PRINTER_RANGE',
    uuid: 'a0000000-0000-0000-0000-000000000019',
    type: 'iprange',
    subnet: '',
    start_ip: '10.0.1.240',
    end_ip: '10.0.1.250',
    associated_interface: 'lan',
    comment: 'Network printers',
    color: 6,
  },
  {
    name: 'UPDATES_FQDN',
    uuid: 'a0000000-0000-0000-0000-000000000020',
    type: 'fqdn',
    subnet: '',
    fqdn: 'update.microsoft.com',
    associated_interface: '',
    comment: 'Microsoft Update servers',
    color: 0,
  },
];

/** Helper: resolve address name to subnet CIDR for evaluation */
export function resolveAddressSubnet(name: string): string {
  const addr = mockAddresses.find((a) => a.name === name);
  if (!addr) return '0.0.0.0/0';

  if (addr.type === 'ipmask') {
    // Convert "10.0.1.0 255.255.255.0" → "10.0.1.0/24"
    const parts = addr.subnet.split(' ');
    if (parts.length === 2) {
      const mask = parts[1];
      const cidr = mask
        .split('.')
        .reduce((acc, octet) => acc + (parseInt(octet) >>> 0).toString(2).split('1').length - 1, 0);
      return `${parts[0]}/${cidr}`;
    }
    return addr.subnet;
  }

  if (addr.type === 'iprange' && addr.start_ip && addr.end_ip) {
    return `${addr.start_ip}-${addr.end_ip}`;
  }

  if (addr.type === 'fqdn' && addr.fqdn) {
    return addr.fqdn;
  }

  return '0.0.0.0/0';
}
