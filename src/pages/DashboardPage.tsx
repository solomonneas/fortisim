import { useMemo } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { mockPolicies } from '../data/mockPolicies';
import { mockZones } from '../data/mockInterfaces';
import { detectConflicts, findUnusedPolicies } from '../utils/conflictDetector';
import { formatCount, formatBytes } from '../utils/formatters';
import type { DashboardStats, FirewallPolicy } from '../types';

/**
 * Dashboard landing page — policy health overview and statistics
 */
export function DashboardPage() {
  // Compute stats
  const stats = useMemo<DashboardStats>(() => {
    const nonImplicit = mockPolicies.filter((p) => p.policyid !== 0);
    const enabled = nonImplicit.filter((p) => p.status === 'enable');
    const disabled = nonImplicit.filter((p) => p.status === 'disable');
    const conflicts = detectConflicts(mockPolicies);
    const unused = findUnusedPolicies(mockPolicies);

    // Top 5 by hit count
    const topPolicies = [...enabled]
      .sort((a, b) => b.hit_count - a.hit_count)
      .slice(0, 5);

    return {
      totalPolicies: nonImplicit.length,
      enabledPolicies: enabled.length,
      disabledPolicies: disabled.length,
      totalHits: nonImplicit.reduce((sum, p) => sum + p.hit_count, 0),
      totalBytes: nonImplicit.reduce((sum, p) => sum + p.bytes, 0),
      unusedPolicies: unused.length,
      conflictCount: conflicts.filter((c) => c.type === 'conflict').length,
      shadowCount: conflicts.filter((c) => c.type === 'shadow').length,
      topPolicies,
    };
  }, []);

  // Zone pair matrix data
  const zonePairs = useMemo(() => {
    const pairs: Array<{
      src: string;
      dst: string;
      allow: number;
      deny: number;
    }> = [];

    const zones = ['LAN', 'WAN', 'DMZ', 'Guest', 'VPN'];

    for (const src of zones) {
      for (const dst of zones) {
        if (src === dst) continue;

        // Find policies matching this zone pair
        const matching = mockPolicies.filter(
          (p) =>
            p.policyid !== 0 &&
            p.status === 'enable' &&
            matchesZone(p.srcintf, src) &&
            matchesZone(p.dstintf, dst)
        );

        if (matching.length > 0) {
          pairs.push({
            src,
            dst,
            allow: matching.filter((p) => p.action === 'accept').length,
            deny: matching.filter((p) => p.action === 'deny').length,
          });
        }
      }
    }

    return pairs;
  }, []);

  const maxHits = Math.max(...stats.topPolicies.map((p) => p.hit_count), 1);
  const hasIssues = stats.conflictCount > 0 || stats.shadowCount > 0 || stats.unusedPolicies > 0;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan" />
          <h1 className="text-lg font-bold text-text">Policy Dashboard</h1>
        </div>
        <div className="text-[10px] text-text-muted">
          Last refreshed: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard
          icon={<Shield className="w-4 h-4" />}
          label="Total Policies"
          value={stats.totalPolicies}
          color="cyan"
        />
        <StatCard
          icon={<Eye className="w-4 h-4" />}
          label="Enabled"
          value={stats.enabledPolicies}
          color="green"
        />
        <StatCard
          icon={<EyeOff className="w-4 h-4" />}
          label="Disabled"
          value={stats.disabledPolicies}
          color="text-muted"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Hits"
          value={formatCount(stats.totalHits)}
          color="cyan"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Total Traffic"
          value={formatBytes(stats.totalBytes)}
          color="cyan"
        />
      </div>

      {/* Alerts Row */}
      {hasIssues && (
        <div className="grid grid-cols-3 gap-3">
          {stats.conflictCount > 0 && (
            <AlertCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Conflicts Detected"
              value={stats.conflictCount}
              severity="high"
              description="Overlapping policies with different actions"
            />
          )}
          {stats.shadowCount > 0 && (
            <AlertCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Shadowed Rules"
              value={stats.shadowCount}
              severity="medium"
              description="Rules unreachable due to broader rules above"
            />
          )}
          {stats.unusedPolicies > 0 && (
            <AlertCard
              icon={<Zap className="w-4 h-4" />}
              label="Unused Policies"
              value={stats.unusedPolicies}
              severity="low"
              description="Enabled policies with zero hits"
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Top Policies */}
        <div className="bg-surface rounded-lg border border-border-subtle p-4">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Top Policies by Hit Count
          </h2>
          <div className="space-y-2">
            {stats.topPolicies.map((policy, idx) => (
              <TopPolicyRow
                key={policy.policyid}
                rank={idx + 1}
                policy={policy}
                maxHits={maxHits}
              />
            ))}
          </div>
        </div>

        {/* Zone Flow Matrix */}
        <div className="bg-surface rounded-lg border border-border-subtle p-4">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Zone Traffic Matrix
          </h2>
          <div className="space-y-1.5">
            {zonePairs.map((pair) => (
              <ZonePairRow key={`${pair.src}-${pair.dst}`} pair={pair} />
            ))}
          </div>
          {zonePairs.length === 0 && (
            <div className="text-[11px] text-text-muted text-center py-4">
              No inter-zone traffic configured.
            </div>
          )}
        </div>
      </div>

      {/* Zone Legend */}
      <div className="bg-surface rounded-lg border border-border-subtle p-3">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
          Network Zones
        </h2>
        <div className="flex flex-wrap gap-3">
          {mockZones.map((zone) => (
            <div
              key={zone.name}
              className="flex items-center gap-2 text-[11px]"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-text-secondary font-medium">
                {zone.name}
              </span>
              <span className="text-text-muted">
                {zone.interfaces.map((i) => i.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Helper: check if interface list matches a zone */
function matchesZone(interfaces: { name: string }[], zoneName: string): boolean {
  // Map zone names to interface names
  const zoneToInterface: Record<string, string[]> = {
    LAN: ['lan'],
    WAN: ['wan1', 'wan2'],
    DMZ: ['dmz'],
    Guest: ['guest-wifi'],
    VPN: ['ssl.root'],
  };

  const ifaceNames = zoneToInterface[zoneName] || [];
  return interfaces.some((i) => ifaceNames.includes(i.name) || i.name === 'any');
}

/** Stat card component */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClass =
    color === 'cyan'
      ? 'text-cyan'
      : color === 'green'
      ? 'text-green'
      : color === 'red'
      ? 'text-red'
      : 'text-text-muted';

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-3">
      <div className={`flex items-center gap-1.5 mb-1 ${colorClass}`}>
        {icon}
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

/** Alert card component */
function AlertCard({
  icon,
  label,
  value,
  severity,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}) {
  const colorClass =
    severity === 'high'
      ? 'border-red/30 bg-red/5'
      : severity === 'medium'
      ? 'border-amber/30 bg-amber/5'
      : 'border-text-muted/20 bg-card/30';

  const textColor =
    severity === 'high'
      ? 'text-red'
      : severity === 'medium'
      ? 'text-amber'
      : 'text-text-muted';

  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${textColor}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-bold mb-0.5 ${textColor}`}>{value}</div>
      <div className="text-[10px] text-text-muted">{description}</div>
    </div>
  );
}

/** Top policy row */
function TopPolicyRow({
  rank,
  policy,
  maxHits,
}: {
  rank: number;
  policy: FirewallPolicy;
  maxHits: number;
}) {
  const pct = (policy.hit_count / maxHits) * 100;

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-4 text-right text-text-muted">{rank}.</span>
      <span className="w-6 text-text-secondary">#{policy.policyid}</span>
      <span className="flex-1 truncate text-text">{policy.name}</span>
      <span className="w-16 text-right text-text-secondary tabular-nums">
        {formatCount(policy.hit_count)}
      </span>
      <div className="w-20 h-1.5 bg-primary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            policy.action === 'accept' ? 'bg-cyan/60' : 'bg-red/60'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Zone pair flow row */
function ZonePairRow({
  pair,
}: {
  pair: { src: string; dst: string; allow: number; deny: number };
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] py-1 px-2 rounded bg-card/30">
      <span className="w-12 text-text-secondary font-medium">{pair.src}</span>
      <ArrowRight className="w-3 h-3 text-text-muted" />
      <span className="w-12 text-text-secondary font-medium">{pair.dst}</span>
      <div className="flex-1" />
      {pair.allow > 0 && (
        <span className="text-green text-[10px] bg-green/10 px-1.5 py-0.5 rounded">
          {pair.allow} ACCEPT
        </span>
      )}
      {pair.deny > 0 && (
        <span className="text-red text-[10px] bg-red/10 px-1.5 py-0.5 rounded">
          {pair.deny} DENY
        </span>
      )}
    </div>
  );
}
