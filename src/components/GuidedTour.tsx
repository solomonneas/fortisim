import { useEffect, useCallback } from 'react';

/**
 * driver.js global types — loaded via CDN in index.html
 * We declare a minimal interface to avoid pulling in the full package.
 */
interface DriverStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  };
}

interface DriverConfig {
  showProgress: boolean;
  steps: DriverStep[];
  animate: boolean;
  overlayColor: string;
  stagePadding: number;
  popoverClass: string;
  onDestroyStarted?: () => void;
  onDestroyed?: () => void;
}

interface DriverInstance {
  drive: () => void;
  destroy: () => void;
  isActive: () => boolean;
}

interface DriverGlobal {
  driver: (config: DriverConfig) => DriverInstance;
}

const TOUR_STORAGE_KEY = 'fortisim-tour-complete';

const tourSteps: DriverStep[] = [
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: '📊 Dashboard',
      description:
        'Your command center. View policy statistics, conflict summaries, hit-count analytics, and the zone traffic matrix at a glance.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-policies"]',
    popover: {
      title: '📋 Policy Table',
      description:
        'Browse all firewall policies with sorting, filtering, and search. Conflict badges highlight shadowed and conflicting rules.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-traffic-sim"]',
    popover: {
      title: '⚡ Traffic Simulator',
      description:
        'Simulate a packet through the firewall. Define source/destination IPs, ports, and zones — then watch the first-match-wins evaluation step by step.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-topology"]',
    popover: {
      title: '🌐 Network Topology',
      description:
        'Visualize the network topology with zones, interfaces, and traffic flow paths between network segments.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-nat"]',
    popover: {
      title: '🔀 NAT Rules',
      description:
        'View and analyze SNAT (IP Pool) and DNAT (VIP) translation rules. See associated policies and hit counts.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-docs"]',
    popover: {
      title: '📖 Documentation',
      description:
        'In-app reference covering Fortinet concepts, policy evaluation logic, conflict detection algorithms, and more. Start here if you\'re new to FortiGate!',
      side: 'bottom',
      align: 'start',
    },
  },
];

/**
 * Check if the driver.js CDN has loaded the global `driver` function.
 */
function getDriverGlobal(): DriverGlobal | null {
  const win = window as unknown as Record<string, unknown>;
  if (typeof win['driver'] === 'function') {
    return win as unknown as DriverGlobal;
  }
  return null;
}

/**
 * Start the guided tour using driver.js (loaded via CDN).
 * Marks the tour as complete in localStorage when finished.
 */
export function startTour(): void {
  const driverGlobal = getDriverGlobal();
  if (!driverGlobal) {
    console.warn('[FortiSim] driver.js not loaded — guided tour unavailable.');
    return;
  }

  const driverObj = driverGlobal.driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 8,
    popoverClass: 'fortisim-tour-popover',
    steps: tourSteps,
    onDestroyStarted: () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      driverObj.destroy();
    },
    onDestroyed: () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    },
  });

  driverObj.drive();
}

/**
 * Check whether the tour has already been completed.
 */
export function isTourComplete(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

/**
 * Reset the tour so it will auto-start on next visit.
 */
export function resetTour(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

/**
 * GuidedTour component — auto-starts the tour on first visit.
 * Renders nothing; side-effect only.
 */
export function GuidedTour(): null {
  const tryStartTour = useCallback(() => {
    if (!isTourComplete()) {
      // Small delay to ensure nav items are rendered and measurable
      const timer = setTimeout(() => {
        startTour();
      }, 800);
      return timer;
    }
    return undefined;
  }, []);

  useEffect(() => {
    const timer = tryStartTour();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tryStartTour]);

  return null;
}
