<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

# 🛡️ Solomon's FortiSim

**Interactive Fortinet firewall rule simulator for safe policy testing and visualization.**

FortiSim lets you build, test, and visualize firewall policies without touching production infrastructure. Create rules in a visual editor, run traffic simulations against them, detect conflicts and shadows, and explore NAT rules and network topology. Includes a guided tour for first-time users.

![FortiSim](docs/screenshots/dashboard.png)

---

## Features

- **Visual Rule Editor** - Create and edit Fortinet-style firewall rules
- **Rule Conflict Detection** - Automatic shadow, contradiction, and unreachable rule detection
- **Traffic Flow Simulation** - Packet-level visualization against your rule set
- **Policy Evaluation Engine** - Real-time rule matching with match highlighting
- **NAT Rule Management** - View and manage NAT translation rules
- **Network Topology** - Interactive topology diagram
- **Guided Tour** - Interactive walkthrough for new users
- **Mock Data** - Sample policies, interfaces, services, addresses, and NAT rules

---

## Quick Start

```bash
git clone https://github.com/solomonneas/fortisim.git
cd fortisim
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | Component UI |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Routing** | React Router 7 | Client-side navigation |
| **Icons** | Lucide React | Consistent icon set |
| **Bundler** | Vite 7 | Dev server and build |

---

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview with policy summary and status |
| **Policy Table** | Full rule list with conflict indicators |
| **Traffic Sim** | Simulate traffic flows against active policies |
| **NAT** | NAT rule viewer and editor |
| **Topology** | Interactive network topology diagram |
| **Docs** | In-app documentation |

---

## Project Structure

```text
fortisim/
├── src/
│   ├── data/
│   │   ├── mockPolicies.ts    # Sample firewall rules
│   │   ├── mockInterfaces.ts  # Network interfaces
│   │   ├── mockServices.ts    # Service definitions
│   │   ├── mockAddresses.ts   # Address objects
│   │   └── mockNATRules.ts    # NAT translation rules
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Policy overview
│   │   ├── PolicyTablePage.tsx # Rule list with conflicts
│   │   ├── TrafficSimPage.tsx # Traffic simulation
│   │   ├── NATPage.tsx        # NAT rule management
│   │   ├── TopologyPage.tsx   # Network topology
│   │   └── DocsPage.tsx       # Documentation
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   ├── conflictDetector.ts # Rule conflict analysis
│   │   ├── policyEvaluator.ts  # Traffic-vs-rule matching
│   │   └── formatters.ts       # Display helpers
│   ├── components/
│   │   ├── GuidedTour.tsx     # First-time walkthrough
│   │   └── layout/
│   │       └── AppShell.tsx   # Main layout wrapper
│   └── App.tsx                # Router configuration
├── index.html
├── vite.config.ts
└── package.json
```

---

## License

MIT
