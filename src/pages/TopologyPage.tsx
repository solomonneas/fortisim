import { useState, useMemo } from 'react';
import { Network } from 'lucide-react';
import { mockZones, mockInterfaces, mockDeviceInfo } from '../data/mockInterfaces';
import { mockPolicies } from '../data/mockPolicies';
import type { FirewallPolicy } from '../types';

/** Zone positions around the central firewall (SVG coordinates) */
const zoneLayout: Record<string, { x: number; y: number }> = {
  WAN: { x: 400, y: 60 },
  LAN: { x: 120, y: 240 },
  DMZ: { x: 680, y: 240 },
  Guest: { x: 200, y: 440 },
  VPN: { x: 600, y: 440 },
};

/** Derive inter-zone traffic flows from policy table */
interface ZoneFlow {
  from: string;
  to: string;
  action: 'accept' | 'deny' | 'mixed';
  services: string[];
  policies: FirewallPolicy[];
}

function deriveZoneFlows(policies: FirewallPolicy[]): ZoneFlow[] {
  const flowMap = new Map<string, ZoneFlow>();

  for (const policy of policies) {
    if (policy.policyid === 0 || policy.status === 'disable') continue;

    for (const srcIntf of policy.srcintf) {
      const srcIface = mockInterfaces.find((i) => i.name === srcIntf.name);
      const srcZone = srcIface?.zone || srcIntf.name;

      for (const dstIntf of policy.dstintf) {
        const dstIface = mockInterfaces.find((i) => i.name === dstIntf.name);
        const dstZone = dstIface?.zone || dstIntf.name;

        if (srcZone === dstZone) continue;

        const key = `${srcZone}->${dstZone}`;
        const existing = flowMap.get(key);

        if (existing) {
          existing.policies.push(policy);
          for (const s of policy.service) {
            if (!existing.services.includes(s.name)) {
              existing.services.push(s.name);
            }
          }
          if (existing.action !== policy.action) {
            existing.action = 'mixed';
          }
        } else {
          flowMap.set(key, {
            from: srcZone,
            to: dstZone,
            action: policy.action,
            services: policy.service.map((s) => s.name),
            policies: [policy],
          });
        }
      }
    }
  }

  return Array.from(flowMap.values());
}

export function TopologyPage() {
  const [hoveredFlow, setHoveredFlow] = useState<ZoneFlow | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const flows = useMemo(() => deriveZoneFlows(mockPolicies), []);

  const cx = 400;
  const cy = 260;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-cyan" />
        <h1 className="text-lg font-bold text-text">Zone Topology</h1>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* SVG Topology Diagram */}
        <div className="bg-surface rounded-lg border border-border-subtle p-2 overflow-hidden">
          <svg viewBox="0 0 800 520" className="w-full h-auto" role="img" aria-label="Network zone topology diagram">
            {/* Background grid */}
            <defs>
              <pattern
                id="topo-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#1a2744"
                  strokeWidth="0.5"
                />
              </pattern>
              <marker
                id="arrow-green"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6" fill="#22c55e" opacity="0.7" />
              </marker>
              <marker
                id="arrow-red"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6" fill="#ef4444" opacity="0.7" />
              </marker>
              <marker
                id="arrow-amber"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6" fill="#f59e0b" opacity="0.7" />
              </marker>
              {/* Glow filter for hovered items */}
              <filter id="glow-cyan">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="800" height="520" fill="#0a0e17" />
            <rect width="800" height="520" fill="url(#topo-grid)" />

            {/* Zone-to-zone flow arrows */}
            {flows.map((flow) => {
              const fromPos = zoneLayout[flow.from];
              const toPos = zoneLayout[flow.to];
              if (!fromPos || !toPos) return null;

              const isHovered =
                hoveredFlow?.from === flow.from && hoveredFlow?.to === flow.to;
              const color =
                flow.action === 'accept'
                  ? '#22c55e'
                  : flow.action === 'deny'
                  ? '#ef4444'
                  : '#f59e0b';
              const markerId =
                flow.action === 'accept'
                  ? 'arrow-green'
                  : flow.action === 'deny'
                  ? 'arrow-red'
                  : 'arrow-amber';

              // Offset lines so bidirectional flows don't overlap
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const nx = -dy / len;
              const ny = dx / len;
              const offset = 6;

              const x1 = fromPos.x + nx * offset;
              const y1 = fromPos.y + ny * offset;
              const x2 = toPos.x + nx * offset;
              const y2 = toPos.y + ny * offset;

              // Shorten line so it doesn't overlap zone cards
              const shortenPx = 65;
              const shortDx = (dx / len) * shortenPx;
              const shortDy = (dy / len) * shortenPx;

              return (
                <g
                  key={`${flow.from}-${flow.to}`}
                  onMouseEnter={() => setHoveredFlow(flow)}
                  onMouseLeave={() => setHoveredFlow(null)}
                  className="cursor-pointer"
                >
                  <line
                    x1={x1 + shortDx}
                    y1={y1 + shortDy}
                    x2={x2 - shortDx}
                    y2={y2 - shortDy}
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    opacity={isHovered ? 0.9 : 0.4}
                    markerEnd={`url(#${markerId})`}
                  />
                  {/* Invisible wider hitbox for easier hovering */}
                  <line
                    x1={x1 + shortDx}
                    y1={y1 + shortDy}
                    x2={x2 - shortDx}
                    y2={y2 - shortDy}
                    stroke="transparent"
                    strokeWidth="12"
                  />
                  {/* Service label on line when hovered */}
                  {isHovered && (
                    <>
                      <rect
                        x={(x1 + x2) / 2 - 50}
                        y={(y1 + y2) / 2 - 18}
                        width="100"
                        height="14"
                        rx="3"
                        fill="#111827"
                        stroke={color}
                        strokeWidth="0.5"
                        opacity="0.95"
                      />
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 8}
                        textAnchor="middle"
                        fill={color}
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {flow.services.slice(0, 3).join(', ')}
                        {flow.services.length > 3 ? '…' : ''}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Central Firewall Node */}
            <g>
              <rect
                x={cx - 50}
                y={cy - 30}
                width={100}
                height={60}
                rx={8}
                fill="#111827"
                stroke="#06b6d4"
                strokeWidth={1.5}
              />
              {/* Shield icon as pure SVG path */}
              <path
                d={`M${cx - 6} ${cy - 16} L${cx} ${cy - 22} L${cx + 6} ${cy - 16} V${cy - 8} C${cx + 6} ${cy - 4} ${cx} ${cy - 2} ${cx} ${cy - 2} C${cx} ${cy - 2} ${cx - 6} ${cy - 4} ${cx - 6} ${cy - 8}Z`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
              />
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {mockDeviceInfo.hostname}
              </text>
              <text
                x={cx}
                y={cy + 24}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="8"
                fontFamily="monospace"
              >
                {mockDeviceInfo.firmware}
              </text>
            </g>

            {/* Zone Cards */}
            {mockZones.map((zone) => {
              const pos = zoneLayout[zone.name];
              if (!pos) return null;

              const ifaces = mockInterfaces.filter((i) => i.zone === zone.name);
              const policyCount = mockPolicies.filter(
                (p) =>
                  p.policyid !== 0 &&
                  (p.srcintf.some((si) =>
                    ifaces.some((iface) => iface.name === si.name)
                  ) ||
                    p.dstintf.some((di) =>
                      ifaces.some((iface) => iface.name === di.name)
                    ))
              ).length;

              const isSelected = selectedZone === zone.name;

              return (
                <g
                  key={zone.name}
                  onClick={() =>
                    setSelectedZone(isSelected ? null : zone.name)
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x={pos.x - 60}
                    y={pos.y - 28}
                    width={120}
                    height={56}
                    rx={6}
                    fill={isSelected ? '#1e293b' : '#111827'}
                    stroke={zone.color}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={0.9}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 10}
                    textAnchor="middle"
                    fill={zone.color}
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {zone.name}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {ifaces.map((i) => i.name).join(', ')}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 16}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {ifaces[0]?.ip || ''} · {policyCount} policies
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Panel: Flow Details */}
        <div className="bg-surface rounded-lg border border-border-subtle p-3">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            {hoveredFlow
              ? `${hoveredFlow.from} → ${hoveredFlow.to}`
              : selectedZone
              ? `Zone: ${selectedZone}`
              : 'Inter-Zone Flows'}
          </h2>

          {hoveredFlow ? (
            <FlowDetail flow={hoveredFlow} />
          ) : selectedZone ? (
            <ZoneDetail zoneName={selectedZone} />
          ) : (
            <div className="space-y-1.5">
              {flows.map((flow) => (
                <div
                  key={`${flow.from}-${flow.to}`}
                  className="flex items-center gap-2 text-[10px] bg-card/50 rounded px-2 py-1.5 border border-border-subtle hover:bg-card transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredFlow(flow)}
                  onMouseLeave={() => setHoveredFlow(null)}
                >
                  <span className="text-text-secondary">
                    {flow.from} → {flow.to}
                  </span>
                  <span
                    className={`ml-auto font-bold ${
                      flow.action === 'accept'
                        ? 'text-green'
                        : flow.action === 'deny'
                        ? 'text-red'
                        : 'text-amber'
                    }`}
                  >
                    {flow.action}
                  </span>
                  <span className="text-text-muted">
                    {flow.policies.length}p
                  </span>
                </div>
              ))}
              {flows.length === 0 && (
                <div className="text-[11px] text-text-muted text-center py-4">
                  No inter-zone flows detected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Flow detail when hovering over an arrow */
function FlowDetail({ flow }: { flow: ZoneFlow }) {
  return (
    <div className="space-y-2">
      <div
        className={`text-[10px] font-bold px-2 py-1 rounded ${
          flow.action === 'accept'
            ? 'bg-green/10 text-green'
            : flow.action === 'deny'
            ? 'bg-red/10 text-red'
            : 'bg-amber/10 text-amber'
        }`}
      >
        {flow.action.toUpperCase()}
      </div>
      <div className="text-[10px] text-text-muted">Services:</div>
      <div className="flex flex-wrap gap-1">
        {flow.services.map((s) => (
          <span
            key={s}
            className="text-[10px] bg-card px-1.5 py-0.5 rounded text-amber/80 border border-amber/10"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="text-[10px] text-text-muted mt-2">Policies:</div>
      <div className="space-y-1">
        {flow.policies.map((p) => (
          <div
            key={p.policyid}
            className="text-[10px] bg-card rounded px-2 py-1 border border-border-subtle flex items-center justify-between"
          >
            <span>
              <span className="text-text-muted">#{p.policyid}</span>{' '}
              <span className="text-text">{p.name}</span>
            </span>
            <span
              className={`font-bold ${
                p.action === 'accept' ? 'text-green' : 'text-red'
              }`}
            >
              {p.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Zone detail when clicking a zone card */
function ZoneDetail({ zoneName }: { zoneName: string }) {
  const zone = mockZones.find((z) => z.name === zoneName);
  const ifaces = mockInterfaces.filter((i) => i.zone === zoneName);

  if (!zone) return null;

  const relatedPolicies = mockPolicies.filter(
    (p) =>
      p.policyid !== 0 &&
      (p.srcintf.some((si) => ifaces.some((iface) => iface.name === si.name)) ||
        p.dstintf.some((di) => ifaces.some((iface) => iface.name === di.name)))
  );

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-text-muted">{zone.description}</div>
      <div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
          Interfaces
        </div>
        {ifaces.map((i) => (
          <div
            key={i.name}
            className="text-[10px] bg-card rounded px-2 py-1 mb-1 border border-border-subtle"
          >
            <div className="flex items-center justify-between">
              <span className="text-text font-medium">{i.name}</span>
              <span
                className={i.status === 'up' ? 'text-green' : 'text-red'}
              >
                {i.status}
              </span>
            </div>
            <div className="text-text-muted">
              {i.ip} · {i.speed} · {i.alias}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
          Related Policies ({relatedPolicies.length})
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {relatedPolicies.map((p) => (
            <div
              key={p.policyid}
              className="text-[10px] bg-card/50 rounded px-2 py-1 border border-border-subtle flex items-center justify-between"
            >
              <span>
                <span className="text-text-muted">#{p.policyid}</span>{' '}
                <span className="text-text-secondary">{p.name}</span>
              </span>
              <span
                className={`font-bold ${
                  p.action === 'accept' ? 'text-green' : 'text-red'
                }`}
              >
                {p.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
