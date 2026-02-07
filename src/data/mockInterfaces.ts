import type { Interface, Zone, DeviceInfo } from '../types';

/** Mock interfaces matching FortiOS /api/v2/cmdb/system/interface */
export const mockInterfaces: Interface[] = [
  {
    name: 'wan1',
    ip: '203.0.113.2/30',
    vdom: 'root',
    type: 'physical',
    status: 'up',
    alias: 'ISP-Primary',
    zone: 'WAN',
    speed: '1000full',
    link: 'up',
    mtu: 1500,
  },
  {
    name: 'wan2',
    ip: '198.51.100.2/30',
    vdom: 'root',
    type: 'physical',
    status: 'up',
    alias: 'ISP-Backup',
    zone: 'WAN',
    speed: '1000full',
    link: 'up',
    mtu: 1500,
  },
  {
    name: 'lan',
    ip: '10.0.1.1/24',
    vdom: 'root',
    type: 'physical',
    status: 'up',
    alias: 'Corporate-LAN',
    zone: 'LAN',
    speed: '10000full',
    link: 'up',
    mtu: 1500,
  },
  {
    name: 'dmz',
    ip: '10.0.100.1/24',
    vdom: 'root',
    type: 'physical',
    status: 'up',
    alias: 'DMZ-Servers',
    zone: 'DMZ',
    speed: '10000full',
    link: 'up',
    mtu: 1500,
  },
  {
    name: 'guest-wifi',
    ip: '10.10.0.1/24',
    vdom: 'root',
    type: 'vlan',
    status: 'up',
    alias: 'Guest-WiFi',
    zone: 'Guest',
    speed: '1000full',
    link: 'up',
    mtu: 1500,
  },
  {
    name: 'ssl.root',
    ip: '172.16.0.1/24',
    vdom: 'root',
    type: 'tunnel',
    status: 'up',
    alias: 'SSL-VPN',
    zone: 'VPN',
    speed: 'auto',
    link: 'up',
    mtu: 1500,
  },
];

/** Mock zones matching FortiOS /api/v2/cmdb/system/zone */
export const mockZones: Zone[] = [
  {
    name: 'WAN',
    interfaces: [
      { name: 'wan1', q_origin_key: 'wan1' },
      { name: 'wan2', q_origin_key: 'wan2' },
    ],
    description: 'Internet-facing zone',
    color: '#ef4444',
  },
  {
    name: 'LAN',
    interfaces: [{ name: 'lan', q_origin_key: 'lan' }],
    description: 'Corporate internal network',
    color: '#22c55e',
  },
  {
    name: 'DMZ',
    interfaces: [{ name: 'dmz', q_origin_key: 'dmz' }],
    description: 'Demilitarized zone — public-facing servers',
    color: '#f59e0b',
  },
  {
    name: 'Guest',
    interfaces: [{ name: 'guest-wifi', q_origin_key: 'guest-wifi' }],
    description: 'Guest wireless access',
    color: '#8b5cf6',
  },
  {
    name: 'VPN',
    interfaces: [{ name: 'ssl.root', q_origin_key: 'ssl.root' }],
    description: 'SSL VPN remote access',
    color: '#06b6d4',
  },
];

/** Mock device info for status bar */
export const mockDeviceInfo: DeviceInfo = {
  hostname: 'FGT-HQ-01',
  firmware: 'FortiOS 7.4.3',
  haStatus: 'Active-Passive',
  uptime: '47d 3h 22m',
  serial: 'FGT60FTK22000001',
  vdom: 'root',
  cpuUsage: 23,
  memUsage: 41,
  sessionCount: 14832,
};
