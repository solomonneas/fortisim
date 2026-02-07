import { useState } from 'react';
import {
  BookOpen,
  Shield,
  Cpu,
  AlertTriangle,
  Zap,
  ArrowRightLeft,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

/* ─── Section IDs for scroll-to navigation ─── */
type SectionId =
  | 'overview'
  | 'fortinet-concepts'
  | 'policy-evaluation'
  | 'conflict-detection'
  | 'traffic-sim'
  | 'nat'
  | 'faq';

interface TocItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tocItems: TocItem[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'fortinet-concepts', label: 'Fortinet Concepts', icon: Shield },
  { id: 'policy-evaluation', label: 'Policy Evaluation', icon: Cpu },
  { id: 'conflict-detection', label: 'Conflict Detection', icon: AlertTriangle },
  { id: 'traffic-sim', label: 'Traffic Simulator Guide', icon: Zap },
  { id: 'nat', label: 'NAT (SNAT / DNAT)', icon: ArrowRightLeft },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

/* ─── Reusable Components ─── */

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-semibold text-cyan mb-3 mt-8 first:mt-0 scroll-mt-20 flex items-center gap-2">
      <ChevronRight className="w-4 h-4 text-cyan/60" />
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-text mt-5 mb-2">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-text-secondary leading-relaxed mb-3">{children}</p>;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-primary border border-border-subtle rounded p-3 text-[11px] text-cyan/90 overflow-x-auto mb-3 font-mono leading-relaxed">
      {children}
    </pre>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cyan/5 border border-cyan/20 rounded-lg p-3 mb-3">
      <div className="text-xs font-semibold text-cyan mb-1">{title}</div>
      <div className="text-xs text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function TableRow({ cells }: { cells: string[] }) {
  return (
    <tr className="border-b border-border-subtle last:border-0">
      {cells.map((cell, i) => (
        <td key={i} className={`py-1.5 px-2 text-xs ${i === 0 ? 'text-cyan font-medium' : 'text-text-secondary'}`}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

/* ─── Page Component ─── */

export function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex gap-6" data-tour="docs-page">
      {/* ─── Sidebar Table of Contents ─── */}
      <aside className="w-52 shrink-0 hidden lg:block">
        <div className="sticky top-20">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Documentation
          </div>
          <nav className="flex flex-col gap-0.5">
            {tocItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left transition-colors
                  ${activeSection === id
                    ? 'bg-cyan/10 text-cyan border border-cyan/20'
                    : 'text-text-secondary hover:text-text hover:bg-card/50'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 max-w-3xl">
        <div className="bg-card border border-border-subtle rounded-lg p-6">
          {/* ═══ OVERVIEW ═══ */}
          <SectionHeading id="overview">Overview</SectionHeading>
          <Paragraph>
            FortiSim is an interactive simulator for Fortinet FortiGate firewall policies.
            It runs entirely in the browser with realistic mock data that mirrors the FortiOS
            REST API format (<code className="text-cyan/80 text-[11px]">/api/v2/cmdb/</code>).
          </Paragraph>
          <Paragraph>
            Use FortiSim to explore how firewall rules are evaluated, detect conflicts in
            your rule set, simulate traffic flows, and understand NAT translations — all
            without needing access to a real FortiGate appliance.
          </Paragraph>
          <InfoCard title="Who is this for?">
            Security engineers, network administrators, students studying for Fortinet NSE
            certifications, and anyone learning firewall policy management concepts.
          </InfoCard>

          {/* ═══ FORTINET CONCEPTS ═══ */}
          <SectionHeading id="fortinet-concepts">Fortinet Concepts</SectionHeading>

          <SubHeading>Firewall Policies</SubHeading>
          <Paragraph>
            FortiGate policies are ordered rules in a table. When a packet arrives, the
            firewall evaluates policies from top to bottom. The <strong className="text-text">first matching policy</strong> determines
            whether the traffic is allowed or denied. This is called <em>first-match-wins</em> logic.
          </Paragraph>
          <Paragraph>
            Each policy defines a 5-tuple match: source zone/interface, destination zone/interface,
            source address, destination address, and service (port/protocol). All five must match
            for the policy to apply.
          </Paragraph>

          <SubHeading>Zones &amp; Interfaces</SubHeading>
          <Paragraph>
            FortiGate interfaces are physical or virtual ports (e.g., <code className="text-cyan/80 text-[11px]">wan1</code>, <code className="text-cyan/80 text-[11px]">lan</code>, <code className="text-cyan/80 text-[11px]">dmz</code>).
            Zones are logical groupings of interfaces. For example, the <strong className="text-text">WAN</strong> zone might
            contain <code className="text-cyan/80 text-[11px]">wan1</code> and <code className="text-cyan/80 text-[11px]">wan2</code>. Policies reference zones (or individual
            interfaces) to define traffic direction.
          </Paragraph>

          <SubHeading>Address Objects</SubHeading>
          <Paragraph>
            Instead of raw IPs in policies, FortiOS uses named address objects. Types include:
          </Paragraph>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-muted">
                  <th className="py-1.5 px-2 font-medium">Type</th>
                  <th className="py-1.5 px-2 font-medium">Format</th>
                  <th className="py-1.5 px-2 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                <TableRow cells={['ipmask', 'IP + subnet mask', '10.0.1.0 255.255.255.0']} />
                <TableRow cells={['iprange', 'Start IP – End IP', '10.0.1.100 – 10.0.1.200']} />
                <TableRow cells={['fqdn', 'Domain name', 'updates.fortinet.com']} />
                <TableRow cells={['wildcard', 'Wildcard mask', '10.0.0.0 0.0.255.255']} />
              </tbody>
            </table>
          </div>

          <SubHeading>Service Objects</SubHeading>
          <Paragraph>
            Services define port/protocol combinations. For example, <strong className="text-text">HTTP</strong> = TCP/80,
            <strong className="text-text"> HTTPS</strong> = TCP/443. The special service <strong className="text-text">ALL</strong> matches
            any port and protocol. Services can specify TCP port ranges, UDP port ranges, or
            ICMP protocol type.
          </Paragraph>

          <SubHeading>Implicit Deny</SubHeading>
          <Paragraph>
            FortiGate always has an implicit deny rule at the bottom of the policy table
            (policy ID 0). If no explicit policy matches a packet, traffic is denied. This is
            a fundamental security principle — deny by default, allow by exception.
          </Paragraph>

          {/* ═══ POLICY EVALUATION ═══ */}
          <SectionHeading id="policy-evaluation">Policy Evaluation</SectionHeading>
          <Paragraph>
            The policy evaluator in FortiSim replicates FortiGate&apos;s packet processing pipeline:
          </Paragraph>
          <CodeBlock>{`Packet: src=10.0.1.50 dst=8.8.8.8 port=443/TCP zone=LAN→WAN

Policy 1: LAN→WAN, LAN_Subnet→all, HTTPS → accept
  ├─ src_zone=LAN  ✓
  ├─ dst_zone=WAN  ✓
  ├─ src_addr=10.0.1.50 in 10.0.1.0/24  ✓
  ├─ dst_addr=8.8.8.8 in all  ✓
  └─ service=TCP/443 in HTTPS  ✓
  → MATCH → action=ACCEPT

Result: ALLOW (Policy 1), SNAT applied via wan1 IP`}</CodeBlock>

          <SubHeading>Match Criteria (5-Tuple)</SubHeading>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-muted">
                  <th className="py-1.5 px-2 font-medium">Field</th>
                  <th className="py-1.5 px-2 font-medium">Description</th>
                  <th className="py-1.5 px-2 font-medium">Wildcard</th>
                </tr>
              </thead>
              <tbody>
                <TableRow cells={['Source Zone', 'Zone or interface where packet originates', 'any']} />
                <TableRow cells={['Dest Zone', 'Zone or interface where packet is heading', 'any']} />
                <TableRow cells={['Source Address', 'IP/subnet of the sender', 'all']} />
                <TableRow cells={['Dest Address', 'IP/subnet of the recipient', 'all']} />
                <TableRow cells={['Service', 'Port and protocol', 'ALL']} />
              </tbody>
            </table>
          </div>

          <InfoCard title="Key Concept: First Match Wins">
            Policy order matters! If Policy 3 denies traffic that Policy 1 allows, the
            traffic is allowed because Policy 1 is evaluated first. This is why shadow and
            conflict detection is critical.
          </InfoCard>

          {/* ═══ CONFLICT DETECTION ═══ */}
          <SectionHeading id="conflict-detection">Conflict Detection</SectionHeading>
          <Paragraph>
            FortiSim analyzes the policy table to find three types of issues:
          </Paragraph>

          <SubHeading>Shadow Detection</SubHeading>
          <Paragraph>
            A <strong className="text-text">shadowed</strong> rule is one where a broader rule above it matches all the
            same traffic. The shadowed rule is unreachable — it will never be hit because the
            broader rule always matches first.
          </Paragraph>
          <CodeBlock>{`Policy 5: LAN→WAN, all→all, ALL → accept     (broad)
Policy 8: LAN→WAN, Server_A→all, HTTPS → accept (narrow)
                                                      ↑ SHADOWED
Policy 8 is shadowed by Policy 5: all traffic that would
match Policy 8 already matches the broader Policy 5 first.`}</CodeBlock>

          <SubHeading>Conflict Detection</SubHeading>
          <Paragraph>
            A <strong className="text-text">conflict</strong> occurs when two policies have overlapping match criteria but
            different actions. Depending on policy order, the same traffic could be either
            allowed or denied.
          </Paragraph>
          <CodeBlock>{`Policy 3: LAN→WAN, LAN_Subnet→all, ALL → accept
Policy 7: LAN→WAN, LAN_Subnet→Blocklist, ALL → deny
                                                  ↑ CONFLICT
These policies overlap for LAN traffic to Blocklist IPs.
Policy 3 allows it (broad), but Policy 7 intends to deny it.
Since Policy 3 comes first, the deny rule never fires.`}</CodeBlock>

          <SubHeading>How It Works Internally</SubHeading>
          <Paragraph>
            The conflict detector converts all address objects to numeric IP ranges for
            precise overlap calculation. For each pair of policies (where one is above the
            other), it checks:
          </Paragraph>
          <div className="text-xs text-text-secondary leading-relaxed mb-3 pl-4">
            <div className="mb-1">1. <strong className="text-text">Interface overlap</strong> — Do the zones/interfaces intersect?</div>
            <div className="mb-1">2. <strong className="text-text">Address superset</strong> — Does the upper rule&apos;s address range fully contain the lower rule&apos;s range?</div>
            <div className="mb-1">3. <strong className="text-text">Service superset</strong> — Does the upper rule&apos;s port range fully contain the lower rule&apos;s port range?</div>
            <div>4. <strong className="text-text">Action comparison</strong> — Same action = shadow/redundant; Different action = conflict</div>
          </div>

          {/* ═══ TRAFFIC SIMULATOR ═══ */}
          <SectionHeading id="traffic-sim">Traffic Simulator Guide</SectionHeading>
          <Paragraph>
            The Traffic Simulator lets you test how the firewall processes a specific packet.
            Follow these steps:
          </Paragraph>

          <SubHeading>Step 1: Define the Packet</SubHeading>
          <Paragraph>
            Enter the source IP address, destination IP address, destination port, protocol
            (TCP, UDP, or ICMP), source zone, and destination zone. Use realistic values
            from the mock data — for example:
          </Paragraph>
          <CodeBlock>{`Source IP:    10.0.1.50    (a host in LAN_Subnet)
Dest IP:     8.8.8.8      (external DNS)
Port:        443           (HTTPS)
Protocol:    TCP
Src Zone:    LAN
Dst Zone:    WAN`}</CodeBlock>

          <SubHeading>Step 2: Run the Simulation</SubHeading>
          <Paragraph>
            Click the Simulate button. The evaluator walks through each enabled policy
            top-to-bottom, checking the 5-tuple match criteria against your packet.
          </Paragraph>

          <SubHeading>Step 3: Review Results</SubHeading>
          <Paragraph>
            The results show every policy that was evaluated, with check/cross marks for
            each criterion. The first matching policy is highlighted, and the final action
            (ALLOW or DENY) is displayed. If NAT applies, the translated addresses are shown.
          </Paragraph>

          <InfoCard title="Tip: Test Edge Cases">
            Try simulating traffic that hits the implicit deny (no policy match), or traffic
            between zones with conflicting policies. This helps you understand how policy
            ordering affects security posture.
          </InfoCard>

          {/* ═══ NAT ═══ */}
          <SectionHeading id="nat">NAT (SNAT / DNAT)</SectionHeading>

          <SubHeading>DNAT — Virtual IPs (VIPs)</SubHeading>
          <Paragraph>
            Destination NAT translates the destination IP/port of incoming traffic. In
            FortiOS, this is configured as a <strong className="text-text">Virtual IP (VIP)</strong>. Common use
            case: publishing an internal web server to the internet.
          </Paragraph>
          <CodeBlock>{`VIP: "WebServer-VIP"
  External: 203.0.113.10:443  (public IP)
  Mapped:   10.0.3.10:443     (internal DMZ server)
  
Incoming traffic to 203.0.113.10:443 is translated to 10.0.3.10:443
before being evaluated against the firewall policy table.`}</CodeBlock>

          <SubHeading>SNAT — IP Pools</SubHeading>
          <Paragraph>
            Source NAT translates the source IP of outgoing traffic. FortiOS offers three
            pool types:
          </Paragraph>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-muted">
                  <th className="py-1.5 px-2 font-medium">Pool Type</th>
                  <th className="py-1.5 px-2 font-medium">Behavior</th>
                </tr>
              </thead>
              <tbody>
                <TableRow cells={['Overload (PAT)', 'Many internal IPs share one external IP via port translation']} />
                <TableRow cells={['One-to-One', 'Each internal IP maps to a unique external IP']} />
                <TableRow cells={['Fixed Port Range', 'Deterministic port allocation per source IP']} />
              </tbody>
            </table>
          </div>

          <SubHeading>NAT Processing Order</SubHeading>
          <Paragraph>
            In FortiOS, DNAT (VIP) is applied <em>before</em> policy lookup — the firewall sees
            the translated destination address when evaluating policies. SNAT (IP Pool or
            interface NAT) is applied <em>after</em> the policy matches.
          </Paragraph>

          {/* ═══ FAQ ═══ */}
          <SectionHeading id="faq">FAQ</SectionHeading>

          <SubHeading>Is this connected to a real FortiGate?</SubHeading>
          <Paragraph>
            No. FortiSim runs entirely in the browser with mock data. No network access,
            API calls, or device connections are required. The data structures mirror the
            FortiOS REST API format for educational accuracy.
          </Paragraph>

          <SubHeading>Can I use my own policy data?</SubHeading>
          <Paragraph>
            Currently, FortiSim uses built-in mock data. To use your own data, you can
            modify the files in <code className="text-cyan/80 text-[11px]">src/data/</code> — the type definitions
            in <code className="text-cyan/80 text-[11px]">src/types/index.ts</code> match the FortiOS API response format,
            so exporting policies from a real FortiGate and pasting them in should work
            with minimal adaptation.
          </Paragraph>

          <SubHeading>Why are FQDN addresses skipped in conflict detection?</SubHeading>
          <Paragraph>
            FQDN (Fully Qualified Domain Name) addresses like <code className="text-cyan/80 text-[11px]">updates.fortinet.com</code> resolve
            to IP addresses via DNS at runtime. Since FortiSim performs static analysis without
            DNS resolution, it cannot determine the IP ranges for FQDN objects. These are
            safely skipped, which may result in missed detections for policies using FQDN addresses.
          </Paragraph>

          <SubHeading>What FortiOS version does this simulate?</SubHeading>
          <Paragraph>
            FortiSim models FortiOS 7.4.x behavior and API structures. The core concepts
            (first-match-wins, zones, VIPs, IP pools) are consistent across FortiOS 6.x and 7.x.
          </Paragraph>

          <SubHeading>How accurate is the conflict detection?</SubHeading>
          <Paragraph>
            The detector performs precise numeric IP range comparison for <code className="text-cyan/80 text-[11px]">ipmask</code> and <code className="text-cyan/80 text-[11px]">iprange</code> address
            types, and port range comparison for services. It correctly handles superset/subset
            relationships, partial overlaps, and the &quot;all&quot;/&quot;any&quot;/&quot;ALL&quot; wildcards. FQDN addresses
            are the only blind spot (see above).
          </Paragraph>

          {/* ─── External Links ─── */}
          <div className="mt-8 pt-4 border-t border-border-subtle">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              External Resources
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan/80 hover:text-cyan transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                FortiOS 7.4 Administration Guide
              </a>
              <a
                href="https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/280967/firewall-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan/80 hover:text-cyan transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                FortiOS Firewall Policies Documentation
              </a>
              <a
                href="https://training.fortinet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan/80 hover:text-cyan transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Fortinet NSE Training &amp; Certification
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
