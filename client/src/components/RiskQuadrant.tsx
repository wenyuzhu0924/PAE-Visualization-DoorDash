import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip,
} from 'recharts';
import { X, ShieldAlert, ShieldCheck, Activity, Shield, Layers, Scale, FileWarning, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, COMPANY_COLORS, riskPoints, riskDomainStandards,
  type RiskPoint,
} from '@/lib/data';

function classifyRiskTier(x: number, y: number): { tier: string; color: string; controls: string[]; icon: 'critical' | 'elevated' | 'operational' | 'standard' } {
  if (x >= 50 && y >= 50) return {
    tier: 'Critical',
    color: 'hsl(0 84% 55%)',
    icon: 'critical',
    controls: ['Exec sign-off', 'Full red-team + audit', 'Immutable audit trails', 'Real-time monitoring', 'Kill-switch', 'Fairness audits'],
  };
  if (x < 50 && y >= 50) return {
    tier: 'Elevated',
    color: 'hsl(27 87% 55%)',
    icon: 'elevated',
    controls: ['Cross-functional review', 'Enhanced oversight', 'Escalation protocols', 'Disparity monitoring'],
  };
  if (x >= 50 && y < 50) return {
    tier: 'Operational',
    color: 'hsl(199 89% 48%)',
    icon: 'operational',
    controls: ['Tech safeguards', 'Auto monitoring', 'Periodic review', 'Circuit breakers'],
  };
  return {
    tier: 'Standard',
    color: 'hsl(142 76% 45%)',
    icon: 'standard',
    controls: ['Standard practices', 'Basic monitoring', 'Regular check-ins'],
  };
}

const TIER_ICONS = {
  critical: ShieldAlert,
  elevated: ShieldAlert,
  operational: Activity,
  standard: ShieldCheck,
};

const DOMAIN_COLORS: Record<string, string> = {
  Brand: 'hsl(280 65% 60%)',
  Communications: 'hsl(199 89% 48%)',
  'Public Policy': 'hsl(0 84% 55%)',
  Legal: 'hsl(340 75% 55%)',
  Insurance: 'hsl(27 87% 55%)',
  'Trust & Safety': 'hsl(350 80% 60%)',
  'Values Alignment': 'hsl(142 76% 45%)',
  Regulatory: 'hsl(45 90% 50%)',
};

const DOMAIN_ICONS: Record<string, typeof Shield> = {
  Brand: Shield,
  Communications: Activity,
  'Public Policy': Gavel,
  Legal: Scale,
  Insurance: FileWarning,
  'Trust & Safety': ShieldAlert,
  'Values Alignment': Layers,
  Regulatory: Gavel,
};

export function RiskQuadrant() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, highlightedCompany } = state;
  const [showDoorDash, setShowDoorDash] = useState(true);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<RiskPoint | null>(null);

  const visiblePoints = useMemo(() => {
    return riskPoints.filter(p => {
      if (!selectedCompanies.includes(p.company)) return false;
      if (p.company === 'DoorDash' && !showDoorDash) return false;
      if (p.company !== 'DoorDash' && !showCompetitors) return false;
      return true;
    });
  }, [selectedCompanies, showDoorDash, showCompetitors]);

  const selectedClassification = useMemo(() => {
    if (!selectedPoint) return null;
    return classifyRiskTier(selectedPoint.x, selectedPoint.y);
  }, [selectedPoint]);

  const quadrantCounts = useMemo(() => {
    const counts = { critical: 0, elevated: 0, operational: 0, standard: 0 };
    visiblePoints.forEach(p => {
      if (p.x >= 50 && p.y >= 50) counts.critical++;
      else if (p.x < 50 && p.y >= 50) counts.elevated++;
      else if (p.x >= 50 && p.y < 50) counts.operational++;
      else counts.standard++;
    });
    return counts;
  }, [visiblePoints]);

  const riskWeightData = useMemo(() => {
    return riskDomainStandards.map(d => ({
      domain: d.domain.length > 12 ? d.domain.slice(0, 10) + '..' : d.domain,
      fullDomain: d.domain,
      avgWeight: parseFloat((d.requirements.reduce((s, r) => s + r.riskWeight, 0) / d.requirements.length).toFixed(1)),
      maxWeight: Math.max(...d.requirements.map(r => r.riskWeight)),
      count: d.requirements.length,
      color: DOMAIN_COLORS[d.domain] || 'hsl(199 89% 48%)',
    }));
  }, []);

  const svgW = 520;
  const svgH = 340;
  const pad = { top: 30, right: 30, bottom: 40, left: 50 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  return (
    <div className="flex flex-col gap-1.5 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <CompanyChips
          companies={COMPANIES}
          selected={selectedCompanies}
          onToggle={(c) => dispatch({ type: 'TOGGLE_COMPANY', company: c })}
          highlighted={highlightedCompany}
          onHighlight={(c) => dispatch({ type: 'SET_HIGHLIGHTED', company: c })}
        />
        <div className="flex items-center gap-3 text-[10px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground" data-testid="toggle-doordash-layer">
            <Switch checked={showDoorDash} onCheckedChange={setShowDoorDash} data-testid="switch-doordash" />
            DoorDash
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground" data-testid="toggle-competitor-layer">
            <Switch checked={showCompetitors} onCheckedChange={setShowCompetitors} data-testid="switch-competitors" />
            Competitors
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 flex-shrink-0">
        {[
          { label: 'Critical', count: quadrantCounts.critical, color: 'hsl(0 84% 55%)', glow: 'glow-border-red', Icon: ShieldAlert },
          { label: 'Elevated', count: quadrantCounts.elevated, color: 'hsl(27 87% 55%)', glow: 'glow-border-orange', Icon: ShieldAlert },
          { label: 'Operational', count: quadrantCounts.operational, color: 'hsl(199 89% 48%)', glow: 'glow-border-blue', Icon: Activity },
          { label: 'Standard', count: quadrantCounts.standard, color: 'hsl(142 76% 45%)', glow: 'glow-border-green', Icon: ShieldCheck },
        ].map(q => (
          <motion.div
            key={q.label}
            className={`glass-card rounded-lg p-2 flex items-center gap-2 ${q.glow}`}
            data-testid={`quadrant-count-${q.label.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <q.Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: q.color }} />
            <span className="text-lg font-bold" style={{ color: q.color }}>{q.count}</span>
            <span className="text-[10px] text-muted-foreground">{q.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-card rounded-xl p-3 glow-border-blue flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Risk Positioning</span>
            <span className="text-[9px] text-muted-foreground font-mono">{visiblePoints.length} systems mapped</span>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full max-w-[600px] mx-auto" style={{ fontFamily: 'var(--font-sans)' }}>
              <defs>
                <linearGradient id="q-tl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(27 87% 50%)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(27 87% 50%)" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="q-tr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(0 84% 55%)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(0 84% 55%)" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="q-bl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(142 76% 45%)" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="hsl(142 76% 45%)" stopOpacity="0.10" />
                </linearGradient>
                <linearGradient id="q-br" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity="0.10" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <rect x={pad.left} y={pad.top} width={plotW / 2} height={plotH / 2} fill="url(#q-tl)" />
              <rect x={pad.left + plotW / 2} y={pad.top} width={plotW / 2} height={plotH / 2} fill="url(#q-tr)" />
              <rect x={pad.left} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2} fill="url(#q-bl)" />
              <rect x={pad.left + plotW / 2} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2} fill="url(#q-br)" />

              <line x1={pad.left} y1={pad.top + plotH / 2} x2={pad.left + plotW} y2={pad.top + plotH / 2} stroke="hsl(217 20% 22%)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={pad.left + plotW / 2} y1={pad.top} x2={pad.left + plotW / 2} y2={pad.top + plotH} stroke="hsl(217 20% 22%)" strokeWidth="1" strokeDasharray="4 4" />
              <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="hsl(217 20% 20%)" strokeWidth="1" rx="4" />

              <text x={pad.left + plotW / 4} y={pad.top + 15} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(27 87% 60%)" filter="url(#glow)">ELEVATED</text>
              <text x={pad.left + 3 * plotW / 4} y={pad.top + 15} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(0 84% 60%)" filter="url(#glow)">CRITICAL</text>
              <text x={pad.left + plotW / 4} y={pad.top + plotH - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(142 76% 50%)" filter="url(#glow)">STANDARD</text>
              <text x={pad.left + 3 * plotW / 4} y={pad.top + plotH - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(199 89% 55%)" filter="url(#glow)">OPERATIONAL</text>

              <text x={pad.left + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill="hsl(210 40% 70%)">Execution Authority</text>
              <text x={10} y={pad.top + plotH / 2} textAnchor="middle" fontSize="9" fontWeight="600" fill="hsl(210 40% 70%)" transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}>Stakeholder Exposure</text>

              {visiblePoints.map((point, idx) => {
                const cx = pad.left + (point.x / 100) * plotW;
                const cy = pad.top + plotH - (point.y / 100) * plotH;
                const color = COMPANY_COLORS[point.company];
                const isHl = highlightedCompany === point.company;
                const isSel = selectedPoint?.id === point.id;
                const labelLen = point.label.length * 4.5 + 12;
                return (
                  <g key={point.id} className="cursor-pointer" onClick={() => setSelectedPoint(isSel ? null : point)} data-testid={`risk-point-${point.id}`}>
                    {(isHl || isSel) && (
                      <rect x={cx - labelLen / 2 - 2} y={cy - 10} width={labelLen + 4} height={20} rx={10} fill="none" stroke={color} strokeWidth="1" opacity="0.4" filter="url(#glow)" />
                    )}
                    <motion.rect
                      x={cx - labelLen / 2} y={cy - 8} width={labelLen} height={16} rx={8}
                      fill={color}
                      fillOpacity={isHl || isSel ? 1 : 0.85}
                      stroke={isSel ? '#fff' : 'none'}
                      strokeWidth={isSel ? 1.5 : 0}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, fillOpacity: isHl || isSel ? 1 : highlightedCompany ? 0.25 : 0.85 }}
                      transition={{ delay: idx * 0.03, duration: 0.4, type: 'spring', stiffness: 200 }}
                    />
                    <motion.text
                      x={cx} y={cy + 2.5} textAnchor="middle" fontSize="7" fontWeight="600" fill="#fff"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: highlightedCompany && !isHl && !isSel ? 0.25 : 1 }}
                      transition={{ delay: idx * 0.03 + 0.1 }}
                      style={{ pointerEvents: 'none' }}
                    >
                      {point.label}
                    </motion.text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center mt-1 flex-shrink-0">
            {selectedCompanies.map(company => (
              <button
                key={company}
                className="flex items-center gap-1 text-[9px] cursor-pointer transition-opacity"
                style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.25 : 1 }}
                onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                data-testid={`risk-legend-${company.replace(/\s/g, '-')}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 5px ${COMPANY_COLORS[company]}50` }} />
                <span className="text-muted-foreground">{company}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-h-0">
          <AnimatePresence>
            {selectedPoint && selectedClassification ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <div className="glass-card rounded-xl" style={{ boxShadow: `0 0 20px ${selectedClassification.color}15, inset 0 0 0 1px ${selectedClassification.color}25` }}>
                  <div className="p-2 border-b border-border/30">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold">{selectedPoint.label}</span>
                      <Button size="icon" variant="ghost" className="w-5 h-5" onClick={() => setSelectedPoint(null)} data-testid="button-close-risk-detail"><X className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(() => { const TIcon = TIER_ICONS[selectedClassification.icon]; return <TIcon className="w-2.5 h-2.5" style={{ color: selectedClassification.color }} />; })()}
                      <Badge className="no-default-active-elevate text-[8px]" style={{ backgroundColor: selectedClassification.color + '20', color: selectedClassification.color, border: `1px solid ${selectedClassification.color}30` }}>{selectedClassification.tier}</Badge>
                      <span className="text-[8px] text-muted-foreground">{selectedPoint.company}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1.5">
                    <p className="text-[9px] text-muted-foreground leading-relaxed">{selectedPoint.description}</p>
                    <div>
                      <p className="text-[8px] font-medium text-muted-foreground mb-0.5">Controls</p>
                      <div className="flex flex-wrap gap-0.5">
                        {selectedPoint.controls.concat(selectedClassification.controls.slice(0, 3)).map((c, i) => (
                          <Badge key={i} variant="outline" className="text-[7px] no-default-active-elevate px-1 py-0" style={{ borderColor: selectedClassification.color + '30', color: selectedClassification.color }}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="glass-card rounded-xl p-2.5 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0 mb-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Risk Weight by Domain</span>
              <span className="text-[8px] text-muted-foreground font-mono">scale 0-5</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskWeightData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: 'hsl(215 20% 45%)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="domain" width={62} tick={{ fill: 'hsl(210 40% 75%)', fontSize: 8 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(222 22% 11%)', border: '1px solid hsl(217 20% 20%)', borderRadius: 8, fontSize: 10, color: 'hsl(210 40% 90%)' }}
                    formatter={(value: number) => [`${value} / 5`, 'Avg Risk Weight']}
                    labelFormatter={(label) => {
                      const item = riskWeightData.find(d => d.domain === label);
                      return item ? item.fullDomain : label;
                    }}
                  />
                  <Bar dataKey="avgWeight" radius={[0, 4, 4, 0]} animationDuration={800}>
                    {riskWeightData.map((entry) => (
                      <Cell key={entry.domain} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 flex-shrink-0">
              {riskWeightData.map(d => (
                <span key={d.domain} className="flex items-center gap-0.5 text-[7px] text-muted-foreground/70">
                  <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  {d.domain}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Governance Standards</span>
              <span className="text-[8px] text-muted-foreground font-mono">{riskDomainStandards.reduce((s, d) => s + d.requirements.length, 0)} requirements</span>
            </div>
            <div className="space-y-0.5 max-h-[140px] overflow-y-auto">
              {riskDomainStandards.map(d => {
                const DIcon = DOMAIN_ICONS[d.domain] || Shield;
                const domainColor = DOMAIN_COLORS[d.domain] || 'hsl(199 89% 48%)';
                const avgW = d.requirements.reduce((s, r) => s + r.riskWeight, 0) / d.requirements.length;
                return (
                  <div key={d.id} className="flex items-center gap-1.5 p-1 rounded hover:bg-white/5 transition-colors" data-testid={`domain-${d.id}`}>
                    <DIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: domainColor }} />
                    <span className="text-[9px] flex-1 truncate">{d.domain}</span>
                    <span className="text-[8px] font-mono" style={{ color: domainColor }}>{d.requirements.length}</span>
                    <div className="w-10 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(avgW / 5) * 100}%`, backgroundColor: domainColor, boxShadow: `0 0 3px ${domainColor}50` }} />
                    </div>
                    <span className="text-[7px] font-mono text-muted-foreground w-4 text-right">{avgW.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
