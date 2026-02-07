import { useState, useCallback } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  ArrowRight,
  Check,
  X,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import type { SimulatedPacket, SimulationResult } from '../types';
import { mockPolicies } from '../data/mockPolicies';
import { mockInterfaces } from '../data/mockInterfaces';
import { simulatePacket } from '../utils/policyEvaluator';
import { isValidIPv4 } from '../utils/formatters';

/** Preset simulation scenarios */
const presets: { label: string; desc: string; packet: SimulatedPacket }[] = [
  {
    label: 'LAN Web Browse',
    desc: 'Corporate user → Internet HTTPS',
    packet: {
      srcIp: '10.0.1.100',
      srcZone: 'lan',
      dstIp: '8.8.8.8',
      dstZone: 'wan1',
      dstPort: 443,
      protocol: 'TCP',
    },
  },
  {
    label: 'Guest DNS',
    desc: 'Guest WiFi → Google DNS',
    packet: {
      srcIp: '10.10.0.50',
      srcZone: 'guest-wifi',
      dstIp: '8.8.8.8',
      dstZone: 'wan1',
      dstPort: 53,
      protocol: 'UDP',
    },
  },
  {
    label: 'VPN to RDP',
    desc: 'Remote user → Internal RDP',
    packet: {
      srcIp: '172.16.0.10',
      srcZone: 'ssl.root',
      dstIp: '10.0.1.50',
      dstZone: 'lan',
      dstPort: 3389,
      protocol: 'TCP',
    },
  },
  {
    label: 'WAN to DMZ Web',
    desc: 'Internet → Public web VIP',
    packet: {
      srcIp: '198.51.100.50',
      srcZone: 'wan1',
      dstIp: '203.0.113.10',
      dstZone: 'dmz',
      dstPort: 443,
      protocol: 'TCP',
    },
  },
  {
    label: 'Guest → LAN (Blocked)',
    desc: 'Guest trying to reach LAN',
    packet: {
      srcIp: '10.10.0.50',
      srcZone: 'guest-wifi',
      dstIp: '10.0.1.10',
      dstZone: 'lan',
      dstPort: 445,
      protocol: 'TCP',
    },
  },
  {
    label: 'DMZ LDAP to DC',
    desc: 'Web server → Domain controller',
    packet: {
      srcIp: '10.0.100.10',
      srcZone: 'dmz',
      dstIp: '10.0.1.10',
      dstZone: 'lan',
      dstPort: 389,
      protocol: 'TCP',
    },
  },
];

export function TrafficSimPage() {
  const [packet, setPacket] = useState<SimulatedPacket>({
    srcIp: '',
    srcZone: 'lan',
    dstIp: '',
    dstZone: 'wan1',
    dstPort: 443,
    protocol: 'TCP',
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<SimulationResult[]>([]);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(-1);

  const zones = mockInterfaces.map((i) => ({
    name: i.name,
    label: `${i.name} (${i.zone})`,
  }));

  const runSimulation = useCallback(() => {
    if (!isValidIPv4(packet.srcIp) || !isValidIPv4(packet.dstIp)) return;

    setAnimating(true);
    setAnimStep(0);
    setResult(null);

    const simResult = simulatePacket(packet, mockPolicies);

    // Animate through steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnimStep(step);
      if (step >= simResult.steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setResult(simResult);
          setAnimating(false);
          setHistory((h) => [simResult, ...h.slice(0, 9)]);
        }, 300);
      }
    }, 150);
  }, [packet]);

  function loadPreset(preset: SimulatedPacket) {
    setPacket(preset);
    setResult(null);
    setAnimStep(-1);
  }

  function replayHistory(sim: SimulationResult) {
    setPacket(sim.packet);
    setResult(sim);
    setAnimStep(sim.steps.length);
  }

  const srcValid = packet.srcIp === '' || isValidIPv4(packet.srcIp);
  const dstValid = packet.dstIp === '' || isValidIPv4(packet.dstIp);
  const canSimulate =
    isValidIPv4(packet.srcIp) && isValidIPv4(packet.dstIp) && !animating;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-cyan" />
        <h1 className="text-lg font-bold text-text">Traffic Flow Simulator</h1>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Left: Simulator */}
        <div className="space-y-4">
          {/* Packet Input Form */}
          <div className="bg-surface rounded-lg border border-border-subtle p-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              Simulated Packet
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Source IP
                </label>
                <input
                  type="text"
                  value={packet.srcIp}
                  onChange={(e) =>
                    setPacket((p) => ({ ...p, srcIp: e.target.value }))
                  }
                  placeholder="10.0.1.100"
                  className={`w-full bg-card border rounded px-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none transition-colors ${
                    srcValid
                      ? 'border-border-subtle focus:border-cyan/40'
                      : 'border-red/40'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Source Zone
                </label>
                <select
                  value={packet.srcZone}
                  onChange={(e) =>
                    setPacket((p) => ({ ...p, srcZone: e.target.value }))
                  }
                  className="w-full bg-card border border-border-subtle rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-cyan/40"
                >
                  {zones.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Destination IP
                </label>
                <input
                  type="text"
                  value={packet.dstIp}
                  onChange={(e) =>
                    setPacket((p) => ({ ...p, dstIp: e.target.value }))
                  }
                  placeholder="8.8.8.8"
                  className={`w-full bg-card border rounded px-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none transition-colors ${
                    dstValid
                      ? 'border-border-subtle focus:border-cyan/40'
                      : 'border-red/40'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Destination Zone
                </label>
                <select
                  value={packet.dstZone}
                  onChange={(e) =>
                    setPacket((p) => ({ ...p, dstZone: e.target.value }))
                  }
                  className="w-full bg-card border border-border-subtle rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-cyan/40"
                >
                  {zones.map((z) => (
                    <option key={z.name} value={z.name}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Destination Port
                </label>
                <input
                  type="number"
                  value={packet.dstPort}
                  onChange={(e) =>
                    setPacket((p) => ({
                      ...p,
                      dstPort: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  max={65535}
                  className="w-full bg-card border border-border-subtle rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-cyan/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted mb-1">
                  Protocol
                </label>
                <select
                  value={packet.protocol}
                  onChange={(e) =>
                    setPacket((p) => ({
                      ...p,
                      protocol: e.target.value as 'TCP' | 'UDP' | 'ICMP',
                    }))
                  }
                  className="w-full bg-card border border-border-subtle rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-cyan/40"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => loadPreset(p.packet)}
                  className="text-[10px] px-2 py-0.5 rounded border border-border-subtle text-text-secondary hover:border-cyan/30 hover:text-cyan transition-colors"
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Simulate Button */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={runSimulation}
                disabled={!canSimulate}
                className="flex items-center gap-1.5 bg-cyan/10 text-cyan border border-cyan/20 px-4 py-1.5 rounded text-xs font-medium hover:bg-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Simulate
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setAnimStep(-1);
                }}
                className="flex items-center gap-1.5 text-text-muted border border-border-subtle px-3 py-1.5 rounded text-xs hover:text-text hover:border-text-muted/30 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Evaluation Log */}
          {(animating || result) && (
            <div className="bg-surface rounded-lg border border-border-subtle p-4">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                Policy Evaluation — Top to Bottom
              </h2>
              <div className="space-y-1">
                {(result?.steps || []).map((step, idx) => {
                  const visible = idx <= animStep;
                  if (!visible) return null;

                  return (
                    <div
                      key={step.policyId}
                      className={`flex items-start gap-2 px-2 py-1.5 rounded text-[11px] font-mono transition-all ${
                        step.matched
                          ? step.action === 'accept'
                            ? 'bg-green/8 border border-green/20'
                            : 'bg-red/8 border border-red/20'
                          : 'bg-card/30 border border-transparent'
                      }`}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {step.matched ? (
                          step.action === 'accept' ? (
                            <Check className="w-3 h-3 text-green" />
                          ) : (
                            <X className="w-3 h-3 text-red" />
                          )
                        ) : (
                          <span className="w-3 h-3 block text-text-muted text-center">
                            ·
                          </span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted w-6 text-right">
                            #{step.policyId}
                          </span>
                          <span
                            className={
                              step.matched ? 'text-text font-medium' : 'text-text-muted'
                            }
                          >
                            {step.policyName}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {Object.entries(step.checks).map(([key, val]) => (
                            <span key={key} className="mr-2">
                              <span className="text-text-muted">{key}</span>
                              <span className={val ? 'text-green' : 'text-red/60'}>
                                {val ? ' ✓' : ' ✗'}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                      {step.matched && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            step.action === 'accept'
                              ? 'bg-green/10 text-green'
                              : 'bg-red/10 text-red'
                          }`}
                        >
                          {step.action?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Final Result */}
              {result && (
                <div className="mt-4 space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.finalAction === 'ALLOW'
                        ? 'bg-green/5 border-green/20'
                        : 'bg-red/5 border-red/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                          result.finalAction === 'ALLOW'
                            ? 'bg-green/10 text-green'
                            : 'bg-red/10 text-red'
                        }`}
                      >
                        {result.finalAction === 'ALLOW' ? '✓' : '✗'}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold ${
                            result.finalAction === 'ALLOW'
                              ? 'text-green'
                              : 'text-red'
                          }`}
                        >
                          {result.finalAction}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {result.matchedPolicy
                            ? `Matched Policy ${result.matchedPolicy.policyid}: ${result.matchedPolicy.name}`
                            : 'No matching policy — implicit deny'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-text-muted">
                      Evaluated {result.steps.length} policies
                    </div>
                  </div>

                  {/* NAT Translation */}
                  {result.natApplied && result.natDetail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan/5 border border-cyan/20">
                      <ArrowRightLeft className="w-4 h-4 text-cyan flex-shrink-0" />
                      <div className="text-[11px]">
                        <div className="text-cyan font-medium mb-1">
                          {result.natDetail.type} Translation Applied
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="font-mono bg-card px-1.5 py-0.5 rounded">
                            {result.natDetail.type === 'SNAT'
                              ? result.natDetail.originalSrc
                              : result.natDetail.originalDst}
                          </span>
                          <ArrowRight className="w-3 h-3 text-cyan" />
                          <span className="font-mono bg-card px-1.5 py-0.5 rounded text-cyan">
                            {result.natDetail.type === 'SNAT'
                              ? result.natDetail.translatedSrc
                              : result.natDetail.translatedDst}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className="bg-surface rounded-lg border border-border-subtle p-3">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Simulation History
          </h2>
          {history.length === 0 ? (
            <div className="text-[11px] text-text-muted text-center py-8">
              No simulations yet.
              <br />
              Run a simulation to see results here.
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((sim, idx) => (
                <button
                  key={idx}
                  onClick={() => replayHistory(sim)}
                  className="w-full text-left bg-card/50 hover:bg-card rounded border border-border-subtle p-2 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-1 py-0 rounded ${
                        sim.finalAction === 'ALLOW'
                          ? 'bg-green/10 text-green'
                          : 'bg-red/10 text-red'
                      }`}
                    >
                      {sim.finalAction}
                    </span>
                    <span className="text-[9px] text-text-muted">
                      {sim.matchedPolicy
                        ? `#${sim.matchedPolicy.policyid}`
                        : 'deny'}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-secondary font-mono truncate">
                    {sim.packet.srcIp}:{sim.packet.srcZone}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="font-mono truncate">
                      {sim.packet.dstIp}:{sim.packet.dstPort}/{sim.packet.protocol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
