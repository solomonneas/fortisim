<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

# 🛡️ Solomon's FortiSim

**Interactive Fortinet firewall rule simulator for safe policy testing and visualization.**

Build, test, and visualize firewall policies without touching production infrastructure. FortiSim provides rule conflict detection, traffic flow simulation, and policy optimization suggestions in a clean browser interface.

## Quick Start

```bash
git clone https://github.com/solomonneas/fortisim.git
cd fortisim
npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- 🔥 Create and edit Fortinet-style firewall rules in a visual editor
- 🔍 Automatic rule conflict and shadow detection
- 🌊 Traffic flow simulation with packet-level visualization
- 📊 Policy optimization suggestions and scoring
- 🎯 Drag-and-drop rule reordering with impact preview
- 📋 Import/export rule sets in standard formats
- ⚡ Real-time rule evaluation against simulated traffic
- 🎨 Color-coded policy visualization (allow, deny, inspect)

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | Component-based UI |
| Language | TypeScript 5 | Type safety |
| Build | Vite 7 | Fast dev server and bundling |
| Styling | Tailwind CSS | Utility-first styling |
| State | React Context | Rule and simulation state |

## Why This Exists

Firewall misconfigurations are one of the top causes of security incidents. FortiSim lets network engineers prototype and validate policy changes in a safe sandbox before deploying to production FortiGate appliances.

## License

MIT
