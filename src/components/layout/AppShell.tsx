import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Zap,
  Network,
  ArrowRightLeft,
  Activity,
  Cpu,
  HardDrive,
  Server,
} from 'lucide-react';
import { mockDeviceInfo } from '../../data/mockInterfaces';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/policies', label: 'Policy Table', icon: Shield },
  { to: '/traffic-sim', label: 'Traffic Simulator', icon: Zap },
  { to: '/topology', label: 'Topology', icon: Network },
  { to: '/nat', label: 'NAT Rules', icon: ArrowRightLeft },
];

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const info = mockDeviceInfo;

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      {/* === Top Navigation Bar === */}
      <header className="bg-surface border-b border-border-subtle">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center h-12 gap-6">
            {/* Branding */}
            <div className="flex items-center gap-2 mr-4">
              <Shield className="w-5 h-5 text-cyan" />
              <span className="text-sm font-bold tracking-wider text-cyan">
                FORTISIM
              </span>
              <span className="text-[10px] text-text-muted ml-1 border border-border-subtle px-1.5 py-0.5 rounded">
                v7.4.3
              </span>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1 h-full">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive =
                  to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors
                      ${
                        isActive
                          ? 'bg-cyan/10 text-cyan border border-cyan/20'
                          : 'text-text-secondary hover:text-text hover:bg-card/50'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Device Identity */}
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="text-text-secondary font-medium">
                  {info.hostname}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* === Main Content === */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-4">
        {children}
      </main>

      {/* === Status Bar === */}
      <footer className="bg-surface/80 border-t border-border-subtle backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-7 text-[10px] text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                {info.hostname}
              </span>
              <span>{info.firmware}</span>
              <span>HA: {info.haStatus}</span>
              <span>Uptime: {info.uptime}</span>
              <span>S/N: {info.serial}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                CPU {info.cpuUsage}%
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                MEM {info.memUsage}%
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {info.sessionCount.toLocaleString()} sessions
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
