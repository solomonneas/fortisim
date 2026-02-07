import { ArrowRightLeft, Globe, Server, ArrowRight, Shield } from 'lucide-react';
import { mockVIPRules, mockSNATPools } from '../data/mockNATRules';
import { mockPolicies } from '../data/mockPolicies';
import { formatCount, formatBytes } from '../utils/formatters';

export function NATPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="w-5 h-5 text-cyan" />
        <h1 className="text-lg font-bold text-text">NAT Rules</h1>
      </div>

      {/* DNAT / VIP Section */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-amber" />
          Destination NAT (VIP / Port Forwarding)
        </h2>
        <div className="space-y-2">
          {mockVIPRules.map((vip) => {
            const policy = mockPolicies.find(
              (p) => p.policyid === vip.associated_policy
            );
            return (
              <div
                key={vip.uuid}
                className="bg-surface rounded-lg border border-border-subtle p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text">
                      {vip.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0 rounded border ${
                        vip.status === 'enable'
                          ? 'border-green/20 text-green bg-green/5'
                          : 'border-text-muted/20 text-text-muted'
                      }`}
                    >
                      {vip.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>Hits: {formatCount(vip.hit_count)}</span>
                    <span>{formatBytes(vip.bytes)}</span>
                  </div>
                </div>

                {/* Visual NAT Diagram */}
                <div className="flex items-center gap-3 py-2">
                  {/* External Side */}
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-text-muted uppercase">
                        External
                      </div>
                      <div className="font-mono text-xs text-red">
                        {vip.extip}:{vip.extport}
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {vip.extintf}
                      </div>
                    </div>
                    <Globe className="w-4 h-4 text-red/60 flex-shrink-0" />
                  </div>

                  {/* Arrow through firewall */}
                  <div className="flex items-center gap-1.5 px-3">
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <div className="w-8 h-8 rounded bg-card border border-cyan/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-cyan" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                  </div>

                  {/* Internal Side */}
                  <div className="flex-1 flex items-center gap-2">
                    <Server className="w-4 h-4 text-green/60 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-text-muted uppercase">
                        Internal
                      </div>
                      <div className="font-mono text-xs text-green">
                        {vip.mappedip}:{vip.mappedport}
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {vip.protocol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Associated Policy */}
                {policy && (
                  <div className="mt-2 text-[10px] bg-card/50 rounded px-2 py-1 border border-border-subtle flex items-center gap-2">
                    <span className="text-text-muted">Policy:</span>
                    <span className="text-text-secondary">
                      #{policy.policyid} {policy.name}
                    </span>
                    <span
                      className={`ml-auto font-bold ${
                        policy.action === 'accept'
                          ? 'text-green'
                          : 'text-red'
                      }`}
                    >
                      {policy.action.toUpperCase()}
                    </span>
                  </div>
                )}

                {vip.comment && (
                  <div className="mt-1 text-[9px] text-text-muted italic">
                    {vip.comment}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SNAT / IP Pool Section */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-cyan" />
          Source NAT (IP Pools)
        </h2>
        <div className="space-y-2">
          {mockSNATPools.map((pool) => (
            <div
              key={pool.uuid}
              className="bg-surface rounded-lg border border-border-subtle p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text">
                    {pool.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0 rounded border border-cyan/20 text-cyan bg-cyan/5">
                    {pool.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  <span>Hits: {formatCount(pool.hit_count)}</span>
                  <span>{formatBytes(pool.bytes)}</span>
                </div>
              </div>

              {/* Visual SNAT Diagram */}
              <div className="flex items-center gap-3 py-2">
                {/* Internal Side */}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-text-muted uppercase">
                      Internal Range
                    </div>
                    <div className="font-mono text-xs text-green">
                      {pool.source_startip}
                      {pool.source_startip !== pool.source_endip &&
                        ` - ${pool.source_endip}`}
                    </div>
                  </div>
                  <Server className="w-4 h-4 text-green/60 flex-shrink-0" />
                </div>

                {/* Arrow through firewall */}
                <div className="flex items-center gap-1.5 px-3">
                  <ArrowRight className="w-3 h-3 text-text-muted" />
                  <div className="w-8 h-8 rounded bg-card border border-cyan/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-cyan" />
                  </div>
                  <ArrowRight className="w-3 h-3 text-text-muted" />
                </div>

                {/* External Side */}
                <div className="flex-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red/60 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-muted uppercase">
                      NAT Pool
                    </div>
                    <div className="font-mono text-xs text-amber">
                      {pool.startip}
                      {pool.startip !== pool.endip && ` - ${pool.endip}`}
                    </div>
                    <div className="text-[9px] text-text-muted">
                      {pool.associated_interface}
                    </div>
                  </div>
                </div>
              </div>

              {/* Associated Policies */}
              <div className="mt-2">
                <div className="text-[10px] text-text-muted mb-1">
                  Associated Policies:
                </div>
                <div className="flex flex-wrap gap-1">
                  {pool.associated_policies.map((pid) => {
                    const pol = mockPolicies.find((p) => p.policyid === pid);
                    return (
                      <span
                        key={pid}
                        className="text-[10px] bg-card px-1.5 py-0.5 rounded border border-border-subtle text-text-secondary"
                        title={pol?.name || ''}
                      >
                        #{pid} {pol?.name || ''}
                      </span>
                    );
                  })}
                </div>
              </div>

              {pool.comments && (
                <div className="mt-1 text-[9px] text-text-muted italic">
                  {pool.comments}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
