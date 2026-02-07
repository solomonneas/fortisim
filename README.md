# FortiSim

**FortiGate Firewall Policy Visualization & Simulation Tool**

FortiSim is a React-based visualization tool for understanding and simulating FortiGate firewall policies. It provides an intuitive interface for network administrators to visualize policy flows, detect conflicts, and simulate traffic before applying changes to production firewalls.

## Features

### 📊 Dashboard
- Policy statistics at a glance (total, enabled, disabled)
- Traffic metrics (hit counts, bytes processed)
- Conflict and shadow detection alerts
- Top policies by hit count
- Zone traffic flow matrix

### 📋 Policy Table
- Full policy table with sortable columns
- Search and filter by name, address, service, or comment
- Color-coded actions (green=ACCEPT, red=DENY)
- Hit count visualization with proportional bars
- Expandable rows for detailed policy information
- Status toggle for enable/disable
- Implicit deny rule always visible at bottom
- Conflict/shadow warning indicators

### ⚡ Traffic Simulator
- Simulate packet flows through the policy table
- Input source/destination IPs, zones, ports, and protocol
- Preset scenarios for common traffic patterns
- Step-by-step policy evaluation visualization
- Final action result (ALLOW/DENY)
- NAT translation display (SNAT/DNAT)
- Simulation history for quick replay

### 🗺️ Topology View
- Zone-based network topology visualization
- Firewall-centric layout with surrounding zones
- Inter-zone traffic flow arrows
- Policy counts per zone pair
- Color-coded allowed/denied flows

### 🔀 NAT Rules
- VIP (DNAT) rule visualization
- SNAT pool configuration display
- External→Internal IP mapping diagrams
- Hit count and traffic statistics

## Technology Stack

- **React 19** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS v4** with custom dark theme
- **React Router v7** for navigation
- **Lucide React** for icons
- **Vite** for build tooling

## Project Structure

```
src/
├── components/
│   └── layout/
│       └── AppShell.tsx      # App shell with navbar and status bar
├── data/
│   ├── mockPolicies.ts       # 25+ firewall policies
│   ├── mockAddresses.ts      # Address objects (subnets, hosts, FQDNs)
│   ├── mockServices.ts       # Service definitions (ports/protocols)
│   ├── mockInterfaces.ts     # Interfaces, zones, device info
│   └── mockNATRules.ts       # VIP and SNAT pool rules
├── pages/
│   ├── DashboardPage.tsx     # Landing dashboard
│   ├── PolicyTablePage.tsx   # Policy table view
│   ├── TrafficSimPage.tsx    # Traffic flow simulator
│   ├── TopologyPage.tsx      # Zone topology view
│   └── NATPage.tsx           # NAT rules view
├── types/
│   └── index.ts              # TypeScript interfaces
├── utils/
│   ├── conflictDetector.ts   # Policy conflict/shadow detection
│   ├── policyEvaluator.ts    # Traffic simulation engine
│   └── formatters.ts         # Number/byte formatting utilities
├── App.tsx                   # Main app with routing
├── main.tsx                  # Entry point
└── index.css                 # Tailwind theme configuration
```

## Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary BG | `#0a0e17` | Main background |
| Surface | `#111827` | Cards, panels |
| Card | `#1e293b` | Elevated surfaces |
| Cyan | `#06b6d4` | Accent, links, highlights |
| Green | `#22c55e` | Accept, enabled, success |
| Red | `#ef4444` | Deny, errors, conflicts |
| Amber | `#f59e0b` | Warnings, shadows |

## FortiOS API Compatibility

Mock data structures mirror FortiOS REST API responses:

- **Policies**: `/api/v2/cmdb/firewall/policy`
- **Addresses**: `/api/v2/cmdb/firewall/address`
- **Services**: `/api/v2/cmdb/firewall.service/custom`
- **Interfaces**: `/api/v2/cmdb/system/interface`
- **VIPs**: `/api/v2/cmdb/firewall/vip`
- **IP Pools**: `/api/v2/cmdb/firewall/ippool`

## Mock Data Scenarios

The included mock data represents a realistic enterprise deployment:

**Zones:**
- WAN (wan1, wan2) - Internet connectivity
- LAN (lan) - Corporate network
- DMZ (dmz) - Public-facing servers
- Guest (guest-wifi) - Guest wireless
- VPN (ssl.root) - Remote access VPN

**Policy Examples:**
- LAN→WAN web browsing with SNAT
- WAN→DMZ inbound via VIPs
- Guest→LAN blocked
- VPN→LAN full access
- DMZ→LAN LDAP authentication

**Intentional Conflicts (for detection testing):**
- Policy 21: Shadowed by broader policy 1
- Policy 22: SSH deny conflicts with MGMT allow
- Policy 23: Shadowed by policy 10's ALL services

## Development

```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT
