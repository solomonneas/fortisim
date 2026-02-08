<div align="center">

# 🛡️ FortiSim

**Interactive Fortinet Firewall Rule Simulator**

Visualize, analyze, and simulate FortiGate firewall policies — entirely in the browser.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br />

<!-- Screenshot placeholder — replace with actual screenshot -->
<img src="https://via.placeholder.com/900x500/0d1117/22d3ee?text=FortiSim+Dashboard" alt="FortiSim Dashboard Screenshot" width="900" />

<br />

[Features](#features) · [Quick Start](#quick-start) · [How It Works](#how-it-works) · [Architecture](#architecture)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 **Policy Table** | Interactive firewall policy table with sorting, filtering, search, and hit-count analytics |
| ⚠️ **Conflict Detection** | Automatically identifies shadowed, conflicting, and redundant firewall rules |
| ⚡ **Traffic Simulator** | Step-by-step packet simulation through the policy table with first-match-wins logic |
| 🌐 **Network Topology** | Visual network topology showing zones, interfaces, and inter-zone traffic flows |
| 🔀 **NAT Management** | View and analyze SNAT (IP Pool) and DNAT (VIP) translation rules |
| 📊 **Dashboard** | At-a-glance statistics: policy counts, hit metrics, conflict summaries, and zone traffic matrix |
| 📖 **In-App Docs** | Built-in documentation covering Fortinet concepts, policy evaluation, and conflict detection |
| 🎯 **Guided Tour** | Interactive onboarding tour for first-time visitors powered by driver.js |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/fortisim.git
cd fortisim

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

FortiSim is a **frontend-only** single-page application — no backend required. All firewall data is provided via realistic mock data that mirrors the FortiOS REST API response format.

```text
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
├─────────────────────────────────────────────────────────────┤
│  React Router ──→ AppShell (top-nav + status bar)           │
│       │                                                     │
│       ├── DashboardPage      (stats, zone matrix)           │
│       ├── PolicyTablePage    (sortable table, conflicts)    │
│       ├── TrafficSimPage     (packet simulator)             │
│       ├── TopologyPage       (network diagram)              │
│       ├── NATPage            (VIP + IP Pool rules)          │
│       └── DocsPage           (in-app documentation)         │
│                                                             │
│  Utils:  policyEvaluator │ conflictDetector │ formatters    │
│  Data:   mockPolicies │ mockInterfaces │ mockServices │ ... │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```text
fortisim/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx        # Top nav bar + status bar layout
│   │   └── GuidedTour.tsx          # Interactive onboarding tour
│   ├── data/
│   │   ├── mockPolicies.ts         # 12+ realistic firewall policies
│   │   ├── mockInterfaces.ts       # Interfaces, zones, device info
│   │   ├── mockServices.ts         # Service objects (HTTP, HTTPS, SSH, etc.)
│   │   ├── mockAddresses.ts        # Address objects (subnets, FQDNs, ranges)
│   │   └── mockNATRules.ts         # VIP (DNAT) and IP Pool (SNAT) rules
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Statistics dashboard
│   │   ├── PolicyTablePage.tsx     # Policy table with conflict badges
│   │   ├── TrafficSimPage.tsx      # Packet simulation engine
│   │   ├── TopologyPage.tsx        # Network topology visualization
│   │   ├── NATPage.tsx             # NAT rule management
│   │   └── DocsPage.tsx            # In-app documentation
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (FortiOS API models)
│   ├── utils/
│   │   ├── policyEvaluator.ts      # First-match-wins simulation engine
│   │   ├── conflictDetector.ts     # Shadow/conflict/redundancy analysis
│   │   └── formatters.ts           # Number, byte, and time formatters
│   ├── App.tsx                     # Router + page layout
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Tailwind CSS imports + theme
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔍 How It Works

### Policy Evaluator (`policyEvaluator.ts`)

Simulates FortiGate's **first-match-wins** packet processing:

1. **Packet Input** — User defines source IP, destination IP, port, protocol, and zones
2. **Top-Down Walk** — Each enabled policy is evaluated in sequence (ordered by `policyid`)
3. **5-Tuple Match** — For each policy, five criteria are checked:
   - Source zone/interface match
   - Destination zone/interface match
   - Source address match (subnet containment, IP range, or FQDN)
   - Destination address match
   - Service/port match (TCP/UDP port ranges, ICMP)
4. **First Match Wins** — The first policy where all five criteria pass determines the action
5. **NAT Check** — If matched, VIP (DNAT) and IP Pool (SNAT) translations are evaluated
6. **Implicit Deny** — If no policy matches, traffic is denied (FortiOS default behavior)

### Conflict Detector (`conflictDetector.ts`)

Analyzes the policy table for three types of issues:

| Type | Severity | Description |
|------|----------|-------------|
| **Shadow** | Medium | A broader rule above makes a narrower rule below unreachable |
| **Conflict** | High | Overlapping criteria between rules with different actions (accept vs deny) |
| **Redundant** | Low | Duplicate match criteria with the same action (wasted rule slot) |

The detector uses **unified IP range comparison** — both `ipmask` (subnet) and `iprange` address types are converted to numeric start/end ranges for precise overlap and containment checks. Port ranges for services are compared similarly.

> **Note:** FQDN address objects are skipped during static analysis since they require DNS resolution at runtime.

## 📚 Fortinet Concepts

FortiSim models real FortiGate concepts:

- **Policies** — Ordered rules evaluated top-to-bottom; first match determines action
- **Zones** — Logical grouping of interfaces (e.g., `LAN`, `WAN`, `DMZ`)
- **Address Objects** — Named references to IPs, subnets, ranges, or FQDNs
- **Service Objects** — Named port/protocol definitions (e.g., `HTTP` = TCP/80)
- **NAT (SNAT/DNAT)** — Source and destination network address translation
- **VIP (Virtual IP)** — FortiOS term for destination NAT / port forwarding
- **IP Pool** — FortiOS term for source NAT pool
- **Implicit Deny** — Default policy that blocks all unmatched traffic

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 19](https://react.dev) | UI framework with hooks |
| [TypeScript 5.9](https://www.typescriptlang.org) | Type-safe development |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [Vite 7](https://vite.dev) | Build tool & dev server |
| [React Router 7](https://reactrouter.com) | Client-side routing |
| [Lucide React](https://lucide.dev) | Icon library |
| [driver.js](https://driverjs.com) | Interactive guided tour |

## 🧑‍💻 Development

```bash
# Lint
npm run lint

# Type check
npm run build

# Preview production build
npm run preview
```

### Design Decisions

- **No backend** — All data is mock, making this instantly deployable as a static site
- **FortiOS API format** — Type definitions mirror real `/api/v2/cmdb/` response shapes
- **Realistic data** — Mock policies include actual FortiGate patterns (implicit deny, VPN rules, DMZ access)
- **Pure computation** — Policy evaluation and conflict detection use no external libraries

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for security professionals and networking enthusiasts** 🔐

</div>
