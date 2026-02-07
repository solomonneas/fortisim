import { useState, useMemo } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { mockPolicies } from '../data/mockPolicies';
import { detectConflicts, findUnusedPolicies } from '../utils/conflictDetector';
import { formatCount, formatBytes, formatTimeAgo } from '../utils/formatters';
import type { FirewallPolicy, PolicyConflict } from '../types';

type SortField =
  | 'policyid'
  | 'name'
  | 'action'
  | 'hit_count'
  | 'status'
  | 'bytes';
type SortDir = 'asc' | 'desc';

export function PolicyTablePage() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('policyid');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [policies, setPolicies] = useState<FirewallPolicy[]>(mockPolicies);
  const [showConflictPanel, setShowConflictPanel] = useState(false);

  const conflicts = useMemo(() => detectConflicts(policies), [policies]);
  const unusedPolicies = useMemo(() => findUnusedPolicies(policies), [policies]);
  const conflictMap = useMemo(() => {
    const map = new Map<number, PolicyConflict>();
    for (const c of conflicts) map.set(c.policyId, c);
    return map;
  }, [conflicts]);

  const enabledCount = policies.filter((p) => p.status === 'enable' && p.policyid !== 0).length;
  const disabledCount = policies.filter((p) => p.status === 'disable').length;
  const maxHits = Math.max(...policies.map((p) => p.hit_count), 1);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return policies;
    const q = search.toLowerCase();
    return policies.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.comments.toLowerCase().includes(q) ||
        p.srcaddr.some((a) => a.name.toLowerCase().includes(q)) ||
        p.dstaddr.some((a) => a.name.toLowerCase().includes(q)) ||
        p.service.some((s) => s.name.toLowerCase().includes(q)) ||
        p.policyid.toString() === q
    );
  }, [policies, search]);

  // Sort — but always keep implicit deny (id=0) at bottom
  const sorted = useMemo(() => {
    const implicitDeny = filtered.find((p) => p.policyid === 0);
    const rest = filtered.filter((p) => p.policyid !== 0);

    rest.sort((a, b) => {
      let cmp = 0;
      const af = a[sortField];
      const bf = b[sortField];
      if (typeof af === 'number' && typeof bf === 'number') {
        cmp = af - bf;
      } else {
        cmp = String(af).localeCompare(String(bf));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return implicitDeny ? [...rest, implicitDeny] : rest;
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function toggleStatus(id: number) {
    setPolicies((prev) =>
      prev.map((p) =>
        p.policyid === id
          ? { ...p, status: p.status === 'enable' ? 'disable' : 'enable' }
          : p
      )
    );
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="w-3" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-cyan" />
    ) : (
      <ChevronDown className="w-3 h-3 text-cyan" />
    );
  }

  function ColHeader({
    field,
    label,
    className = '',
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) {
    return (
      <th
        className={`px-2 py-2 text-left cursor-pointer select-none hover:text-cyan transition-colors ${className}`}
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIcon field={field} />
        </span>
      </th>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text">Firewall Policies</h1>
          <span className="text-[10px] bg-card px-2 py-0.5 rounded text-text-secondary border border-border-subtle">
            {filtered.length} policies
            <span className="text-green ml-1">({enabledCount} enabled</span>
            <span className="text-text-muted">, {disabledCount} disabled)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Conflict Summary Button */}
          <button
            onClick={() => setShowConflictPanel(!showConflictPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded border transition-colors
              ${
                conflicts.length > 0
                  ? 'border-amber/30 text-amber hover:bg-amber/10'
                  : 'border-border-subtle text-text-muted'
              }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {conflicts.length} issues
            {unusedPolicies.length > 0 && (
              <span className="text-text-muted">· {unusedPolicies.length} unused</span>
            )}
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-border-subtle rounded pl-7 pr-3 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-cyan/40 w-56 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Conflict Summary Panel */}
      {showConflictPanel && (
        <div className="mb-4 bg-card border border-amber/20 rounded-lg p-3 animate-slide-down">
          <h3 className="text-xs font-bold text-amber mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Policy Analysis
          </h3>
          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div className="bg-surface rounded p-2 border border-border-subtle">
              <div className="text-red font-bold text-lg">
                {conflicts.filter((c) => c.type === 'conflict').length}
              </div>
              <div className="text-text-muted">Conflicts</div>
            </div>
            <div className="bg-surface rounded p-2 border border-border-subtle">
              <div className="text-amber font-bold text-lg">
                {conflicts.filter((c) => c.type === 'shadow').length}
              </div>
              <div className="text-text-muted">Shadowed</div>
            </div>
            <div className="bg-surface rounded p-2 border border-border-subtle">
              <div className="text-text-muted font-bold text-lg">
                {unusedPolicies.length}
              </div>
              <div className="text-text-muted">Unused (0 hits)</div>
            </div>
          </div>
          {conflicts.length > 0 && (
            <div className="mt-2 space-y-1">
              {conflicts.map((c) => (
                <div
                  key={`${c.policyId}-${c.conflictsWith}`}
                  className={`text-[10px] px-2 py-1 rounded border ${
                    c.type === 'conflict'
                      ? 'border-red/20 bg-red/5 text-red'
                      : 'border-amber/20 bg-amber/5 text-amber'
                  }`}
                >
                  <span className="font-medium">Policy {c.policyId}:</span>{' '}
                  {c.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Policy Table */}
      <div className="bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-card/50 text-text-muted border-b border-border-subtle uppercase tracking-wider text-[10px]">
                <ColHeader field="policyid" label="ID" className="w-12" />
                <ColHeader field="name" label="Name" className="min-w-[140px]" />
                <th className="px-2 py-2 text-left">From</th>
                <th className="px-2 py-2 text-left">To</th>
                <th className="px-2 py-2 text-left">Source</th>
                <th className="px-2 py-2 text-left">Destination</th>
                <th className="px-2 py-2 text-left">Service</th>
                <ColHeader field="action" label="Action" className="w-20" />
                <th className="px-2 py-2 text-left w-12">NAT</th>
                <th className="px-2 py-2 text-left w-12">Log</th>
                <ColHeader field="hit_count" label="Hits" className="w-28" />
                <ColHeader field="status" label="Status" className="w-16" />
                <th className="px-2 py-2 w-6" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((policy) => {
                const isImplicit = policy.policyid === 0;
                const isExpanded = expandedRow === policy.policyid;
                const conflict = conflictMap.get(policy.policyid);
                const isDisabled = policy.status === 'disable';
                const hitPct = (policy.hit_count / maxHits) * 100;

                return (
                  <PolicyRow
                    key={policy.policyid}
                    policy={policy}
                    isImplicit={isImplicit}
                    isExpanded={isExpanded}
                    isDisabled={isDisabled}
                    conflict={conflict}
                    hitPct={hitPct}
                    onToggleExpand={() =>
                      setExpandedRow(isExpanded ? null : policy.policyid)
                    }
                    onToggleStatus={() => toggleStatus(policy.policyid)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Individual policy row + expandable detail panel */
function PolicyRow({
  policy,
  isImplicit,
  isExpanded,
  isDisabled,
  conflict,
  hitPct,
  onToggleExpand,
  onToggleStatus,
}: {
  policy: FirewallPolicy;
  isImplicit: boolean;
  isExpanded: boolean;
  isDisabled: boolean;
  conflict?: PolicyConflict;
  hitPct: number;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
}) {
  const rowBase = isImplicit
    ? 'border-b border-dashed border-border-subtle bg-red/[0.02]'
    : isDisabled
    ? 'border-b border-border-subtle opacity-50'
    : 'border-b border-border-subtle hover:bg-card/30';

  return (
    <>
      <tr
        className={`${rowBase} cursor-pointer transition-colors`}
        onClick={onToggleExpand}
      >
        {/* ID */}
        <td className="px-2 py-1.5">
          <span className="flex items-center gap-1">
            {conflict && (
              <AlertTriangle
                className={`w-3 h-3 flex-shrink-0 ${
                  conflict.type === 'conflict' ? 'text-red' : 'text-amber'
                }`}
                title={conflict.description}
              />
            )}
            <span className={isImplicit ? 'text-text-muted' : 'text-text-secondary'}>
              {isImplicit ? '—' : policy.policyid}
            </span>
          </span>
        </td>

        {/* Name */}
        <td className="px-2 py-1.5 font-medium text-text truncate max-w-[180px]">
          {policy.name}
        </td>

        {/* From (srcintf) */}
        <td className="px-2 py-1.5">
          <InterfaceBadges items={policy.srcintf} />
        </td>

        {/* To (dstintf) */}
        <td className="px-2 py-1.5">
          <InterfaceBadges items={policy.dstintf} />
        </td>

        {/* Source */}
        <td className="px-2 py-1.5">
          <AddressBadges items={policy.srcaddr} />
        </td>

        {/* Destination */}
        <td className="px-2 py-1.5">
          <AddressBadges items={policy.dstaddr} />
        </td>

        {/* Service */}
        <td className="px-2 py-1.5">
          <ServiceBadges items={policy.service} />
        </td>

        {/* Action */}
        <td className="px-2 py-1.5">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              policy.action === 'accept'
                ? 'bg-green/10 text-green border border-green/20'
                : 'bg-red/10 text-red border border-red/20'
            }`}
          >
            {policy.action.toUpperCase()}
          </span>
        </td>

        {/* NAT */}
        <td className="px-2 py-1.5 text-text-muted">
          {policy.nat === 'enable' ? (
            <span className="text-cyan text-[10px]">✓</span>
          ) : (
            '—'
          )}
        </td>

        {/* Log */}
        <td className="px-2 py-1.5 text-[10px] text-text-muted">
          {policy.logtraffic === 'all'
            ? 'ALL'
            : policy.logtraffic === 'utm'
            ? 'UTM'
            : '—'}
        </td>

        {/* Hits */}
        <td className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary w-10 text-right tabular-nums">
              {formatCount(policy.hit_count)}
            </span>
            <div className="flex-1 h-1.5 bg-primary rounded-full overflow-hidden min-w-[40px]">
              <div
                className={`h-full rounded-full transition-all ${
                  policy.action === 'accept' ? 'bg-cyan/60' : 'bg-red/60'
                }`}
                style={{ width: `${hitPct}%` }}
              />
            </div>
          </div>
        </td>

        {/* Status Toggle */}
        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
          {!isImplicit && (
            <button
              onClick={onToggleStatus}
              className="flex items-center"
              title={policy.status === 'enable' ? 'Disable policy' : 'Enable policy'}
            >
              {policy.status === 'enable' ? (
                <Eye className="w-3.5 h-3.5 text-green" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>
          )}
        </td>

        {/* Expand */}
        <td className="px-2 py-1.5">
          <ChevronRight
            className={`w-3 h-3 text-text-muted transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </td>
      </tr>

      {/* Expanded Detail */}
      {isExpanded && (
        <tr>
          <td colSpan={13} className="bg-card/50 border-b border-border-subtle">
            <PolicyDetail policy={policy} conflict={conflict} />
          </td>
        </tr>
      )}
    </>
  );
}

function PolicyDetail({
  policy,
  conflict,
}: {
  policy: FirewallPolicy;
  conflict?: PolicyConflict;
}) {
  return (
    <div className="px-4 py-3 animate-fade-in">
      <div className="grid grid-cols-4 gap-4 text-[11px]">
        <DetailBlock label="Source Addresses">
          {policy.srcaddr.map((a) => (
            <div key={a.name} className="text-text-secondary">
              {a.name}
            </div>
          ))}
        </DetailBlock>
        <DetailBlock label="Destination Addresses">
          {policy.dstaddr.map((a) => (
            <div key={a.name} className="text-text-secondary">
              {a.name}
            </div>
          ))}
        </DetailBlock>
        <DetailBlock label="Services">
          {policy.service.map((s) => (
            <div key={s.name} className="text-text-secondary">
              {s.name}
            </div>
          ))}
        </DetailBlock>
        <DetailBlock label="Statistics">
          <div className="text-text-secondary">
            Bytes: {formatBytes(policy.bytes)}
          </div>
          <div className="text-text-secondary">
            Sessions: {policy.session_count.toLocaleString()}
          </div>
          <div className="text-text-secondary">
            Last hit: {formatTimeAgo(policy.last_used)}
          </div>
          <div className="text-text-secondary">
            Schedule: {policy.schedule}
          </div>
        </DetailBlock>
      </div>

      {policy.comments && (
        <div className="mt-2 text-[10px] text-text-muted italic">
          {policy.comments}
        </div>
      )}

      <div className="mt-1.5 text-[9px] text-text-muted font-mono">
        UUID: {policy.uuid}
      </div>

      {conflict && (
        <div
          className={`mt-2 px-2 py-1 rounded text-[10px] border ${
            conflict.type === 'conflict'
              ? 'border-red/20 bg-red/5 text-red'
              : 'border-amber/20 bg-amber/5 text-amber'
          }`}
        >
          ⚠ {conflict.description}
        </div>
      )}
    </div>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function InterfaceBadges({ items }: { items: { name: string }[] }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {items.map((i) => (
        <span
          key={i.name}
          className="bg-cyan/8 text-cyan/80 px-1 py-0 rounded text-[10px] border border-cyan/10"
        >
          {i.name}
        </span>
      ))}
    </div>
  );
}

function AddressBadges({ items }: { items: { name: string }[] }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {items.map((a) => (
        <span
          key={a.name}
          className="text-text-secondary text-[10px] bg-surface px-1 py-0 rounded border border-border-subtle truncate max-w-[120px]"
          title={a.name}
        >
          {a.name}
        </span>
      ))}
    </div>
  );
}

function ServiceBadges({ items }: { items: { name: string }[] }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {items.map((s) => (
        <span
          key={s.name}
          className="text-amber/80 text-[10px] bg-amber/5 px-1 py-0 rounded border border-amber/10"
        >
          {s.name}
        </span>
      ))}
    </div>
  );
}
