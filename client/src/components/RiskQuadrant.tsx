import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip,
} from 'recharts';
import { X, ShieldAlert, ShieldCheck, Activity, Shield, Layers, Scale, FileWarning, Gavel, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, COMPANY_COLORS, RISK_COLORS, DOMAIN_COLORS_MAP,
  riskPoints, riskDomainStandards,
  type RiskPoint,
} from '@/lib/data';

type QuadrantKey = 'critical' | 'elevated' | 'operational' | 'standard';

interface QuadrantInfo {
  key: QuadrantKey;
  title: string;
  color: string;
  icon: typeof ShieldAlert;
  axisDescription: string;
  meaning: string;
  examples: string;
  governanceResponse: string;
  controls: string[];
}

const QUADRANT_INFO: Record<QuadrantKey, QuadrantInfo> = {
  critical: {
    key: 'critical',
    title: 'Critical Risk',
    color: RISK_COLORS.Critical,
    icon: ShieldAlert,
    axisDescription: 'High Execution Authority + High Stakeholder Exposure',
    meaning: 'AI systems that make autonomous decisions affecting large numbers of external stakeholders (consumers, merchants, Dashers). These carry the highest governance burden because failures are both likely to occur independently and highly visible.',
    examples: 'Autonomous dispatch allocation, cross-network pricing, AI-driven safety moderation at scale.',
    governanceResponse: 'Requires executive sign-off, full red-team audits, immutable audit trails, real-time kill-switches, and continuous fairness monitoring before deployment.',
    controls: ['Executive sign-off', 'Full red-team + audit', 'Immutable audit trails', 'Real-time monitoring', 'Kill-switch capability', 'Fairness audits'],
  },
  elevated: {
    key: 'elevated',
    title: 'Elevated Risk',
    color: RISK_COLORS.Elevated,
    icon: ShieldAlert,
    axisDescription: 'Low Execution Authority + High Stakeholder Exposure',
    meaning: 'AI systems that affect many stakeholders but operate with human oversight or limited autonomy. The risk comes from broad exposure even though a human remains in the loop for key decisions.',
    examples: 'AI-assisted customer communications, generative content tools with human review, policy recommendation engines.',
    governanceResponse: 'Requires cross-functional review boards, enhanced monitoring with escalation protocols, and regular disparity audits.',
    controls: ['Cross-functional review', 'Enhanced oversight', 'Escalation protocols', 'Disparity monitoring'],
  },
  operational: {
    key: 'operational',
    title: 'Operational Risk',
    color: RISK_COLORS.Operational,
    icon: Activity,
    axisDescription: 'High Execution Authority + Low Stakeholder Exposure',
    meaning: 'AI systems with significant autonomous decision-making power but limited external-facing impact. Failures are contained to internal operations or narrow use cases rather than affecting the public broadly.',
    examples: 'Internal dispatch optimization, automated fraud detection for merchants, autonomous delivery robots in limited geographies.',
    governanceResponse: 'Requires technical safeguards, automated monitoring systems, periodic reviews, and circuit breakers to contain failures.',
    controls: ['Technical safeguards', 'Automated monitoring', 'Periodic review', 'Circuit breakers'],
  },
  standard: {
    key: 'standard',
    title: 'Standard Risk',
    color: RISK_COLORS.Standard,
    icon: ShieldCheck,
    axisDescription: 'Low Execution Authority + Low Stakeholder Exposure',
    meaning: 'AI systems that operate under human supervision with limited external impact. These represent the lowest governance burden, as both the decision scope and stakeholder reach are constrained.',
    examples: 'AI-generated menu photos, internal analytics dashboards, merchant onboarding suggestions.',
    governanceResponse: 'Standard development practices with basic monitoring and regular check-ins are sufficient.',
    controls: ['Standard practices', 'Basic monitoring', 'Regular check-ins'],
  },
};

function classifyRiskTier(x: number, y: number): { tier: string; color: string; controls: string[]; icon: 'critical' | 'elevated' | 'operational' | 'standard' } {
  if (x >= 50 && y >= 50) return {
    tier: 'Critical',
    color: RISK_COLORS.Critical,
    icon: 'critical',
    controls: QUADRANT_INFO.critical.controls,
  };
  if (x < 50 && y >= 50) return {
    tier: 'Elevated',
    color: RISK_COLORS.Elevated,
    icon: 'elevated',
    controls: QUADRANT_INFO.elevated.controls,
  };
  if (x >= 50 && y < 50) return {
    tier: 'Operational',
    color: RISK_COLORS.Operational,
    icon: 'operational',
    controls: QUADRANT_INFO.operational.controls,
  };
  return {
    tier: 'Standard',
    color: RISK_COLORS.Standard,
    icon: 'standard',
    controls: QUADRANT_INFO.standard.controls,
  };
}

const TIER_ICONS = {
  critical: ShieldAlert,
  elevated: ShieldAlert,
  operational: Activity,
  standard: ShieldCheck,
};

const DOMAIN_COLORS = DOMAIN_COLORS_MAP;

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
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | null>(null);

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

  const quadrantPointsList = useMemo(() => {
    if (!selectedQuadrant) return [];
    return visiblePoints.filter(p => {
      if (selectedQuadrant === 'critical') return p.x >= 50 && p.y >= 50;
      if (selectedQuadrant === 'elevated') return p.x < 50 && p.y >= 50;
      if (selectedQuadrant === 'operational') return p.x >= 50 && p.y < 50;
      return p.x < 50 && p.y < 50;
    });
  }, [selectedQuadrant, visiblePoints]);

  const riskWeightData = useMemo(() => {
    return riskDomainStandards.map(d => ({
      domain: d.domain.length > 12 ? d.domain.slice(0, 10) + '..' : d.domain,
      fullDomain: d.domain,
      avgWeight: parseFloat((d.requirements.reduce((s, r) => s + r.riskWeight, 0) / d.requirements.length).toFixed(1)),
      maxWeight: Math.max(...d.requirements.map(r => r.riskWeight)),
      count: d.requirements.length,
      color: DOMAIN_COLORS[d.domain] || '#22D3EE',
    }));
  }, []);

  const svgW = 520;
  const svgH = 340;
  const pad = { top: 30, right: 30, bottom: 40, left: 50 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const handleQuadrantClick = (key: QuadrantKey) => {
    setSelectedQuadrant(selectedQuadrant === key ? null : key);
    setSelectedPoint(null);
  };

  const handlePointClick = (point: RiskPoint) => {
    if (selectedPoint?.id === point.id) {
      setSelectedPoint(null);
    } else {
      setSelectedPoint(point);
      setSelectedQuadrant(null);
    }
  };

  const activeQuadrantInfo = selectedQuadrant ? QUADRANT_INFO[selectedQuadrant] : null;

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <CompanyChips
          companies={COMPANIES}
          selected={selectedCompanies}
          onToggle={(c) => dispatch({ type: 'TOGGLE_COMPANY', company: c })}
          highlighted={highlightedCompany}
          onHighlight={(c) => dispatch({ type: 'SET_HIGHLIGHTED', company: c })}
        />
        <div className="flex items-center gap-3 text-[10px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/50" data-testid="toggle-doordash-layer">
            <Switch checked={showDoorDash} onCheckedChange={setShowDoorDash} data-testid="switch-doordash" />
            DoorDash
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/50" data-testid="toggle-competitor-layer">
            <Switch checked={showCompetitors} onCheckedChange={setShowCompetitors} data-testid="switch-competitors" />
            Competitors
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {([
          { key: 'critical' as QuadrantKey, label: 'Critical', count: quadrantCounts.critical, color: RISK_COLORS.Critical, glow: 'glow-border-pink', Icon: ShieldAlert },
          { key: 'elevated' as QuadrantKey, label: 'Elevated', count: quadrantCounts.elevated, color: RISK_COLORS.Elevated, glow: 'glow-border-gold', Icon: ShieldAlert },
          { key: 'operational' as QuadrantKey, label: 'Operational', count: quadrantCounts.operational, color: RISK_COLORS.Operational, glow: 'glow-border-cyan', Icon: Activity },
          { key: 'standard' as QuadrantKey, label: 'Standard', count: quadrantCounts.standard, color: RISK_COLORS.Standard, glow: 'glow-border-teal', Icon: ShieldCheck },
        ]).map(q => (
          <motion.div
            key={q.label}
            className={`glass-card rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-all duration-200 ${q.glow}`}
            style={{
              outline: selectedQuadrant === q.key ? `1.5px solid ${q.color}` : 'none',
              boxShadow: selectedQuadrant === q.key ? `0 0 20px ${q.color}30` : undefined,
            }}
            data-testid={`quadrant-count-${q.label.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => handleQuadrantClick(q.key)}
          >
            <q.Icon className="w-4 h-4 flex-shrink-0" style={{ color: q.color, filter: `drop-shadow(0 0 4px ${q.color}60)` }} />
            <span className="text-lg font-bold" style={{ color: q.color }}>{q.count}</span>
            <span className="text-[10px] text-muted-foreground/50">{q.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-card rounded-xl p-3 glow-border-blue flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Risk Positioning</span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">{visiblePoints.length} systems</span>
          </div>
          <div className="w-full flex-1 min-h-0 chart-glow">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full max-w-[600px] mx-auto" style={{ fontFamily: 'var(--font-sans)' }}>
              <defs>
                <linearGradient id="q-tl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Elevated} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={RISK_COLORS.Elevated} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="q-tr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Critical} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={RISK_COLORS.Critical} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="q-bl" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Standard} stopOpacity="0.02" />
                  <stop offset="100%" stopColor={RISK_COLORS.Standard} stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="q-br" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Operational} stopOpacity="0.02" />
                  <stop offset="100%" stopColor={RISK_COLORS.Operational} stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="q-tl-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Elevated} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={RISK_COLORS.Elevated} stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="q-tr-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Critical} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={RISK_COLORS.Critical} stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="q-bl-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Standard} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={RISK_COLORS.Standard} stopOpacity="0.30" />
                </linearGradient>
                <linearGradient id="q-br-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.Operational} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={RISK_COLORS.Operational} stopOpacity="0.30" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <filter id="point-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <rect
                x={pad.left} y={pad.top} width={plotW / 2} height={plotH / 2}
                fill={selectedQuadrant === 'elevated' ? 'url(#q-tl-active)' : 'url(#q-tl)'}
                className="cursor-pointer" onClick={() => handleQuadrantClick('elevated')}
                stroke={selectedQuadrant === 'elevated' ? RISK_COLORS.Elevated : 'none'} strokeWidth={selectedQuadrant === 'elevated' ? 1.5 : 0} strokeDasharray={selectedQuadrant === 'elevated' ? '4 2' : ''}
                data-testid="quadrant-area-elevated"
              />
              <rect
                x={pad.left + plotW / 2} y={pad.top} width={plotW / 2} height={plotH / 2}
                fill={selectedQuadrant === 'critical' ? 'url(#q-tr-active)' : 'url(#q-tr)'}
                className="cursor-pointer" onClick={() => handleQuadrantClick('critical')}
                stroke={selectedQuadrant === 'critical' ? RISK_COLORS.Critical : 'none'} strokeWidth={selectedQuadrant === 'critical' ? 1.5 : 0} strokeDasharray={selectedQuadrant === 'critical' ? '4 2' : ''}
                data-testid="quadrant-area-critical"
              />
              <rect
                x={pad.left} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2}
                fill={selectedQuadrant === 'standard' ? 'url(#q-bl-active)' : 'url(#q-bl)'}
                className="cursor-pointer" onClick={() => handleQuadrantClick('standard')}
                stroke={selectedQuadrant === 'standard' ? RISK_COLORS.Standard : 'none'} strokeWidth={selectedQuadrant === 'standard' ? 1.5 : 0} strokeDasharray={selectedQuadrant === 'standard' ? '4 2' : ''}
                data-testid="quadrant-area-standard"
              />
              <rect
                x={pad.left + plotW / 2} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2}
                fill={selectedQuadrant === 'operational' ? 'url(#q-br-active)' : 'url(#q-br)'}
                className="cursor-pointer" onClick={() => handleQuadrantClick('operational')}
                stroke={selectedQuadrant === 'operational' ? RISK_COLORS.Operational : 'none'} strokeWidth={selectedQuadrant === 'operational' ? 1.5 : 0} strokeDasharray={selectedQuadrant === 'operational' ? '4 2' : ''}
                data-testid="quadrant-area-operational"
              />

              <line x1={pad.left} y1={pad.top + plotH / 2} x2={pad.left + plotW} y2={pad.top + plotH / 2} stroke="hsl(220 20% 18%)" strokeWidth="1" strokeDasharray="4 4" style={{ pointerEvents: 'none' }} />
              <line x1={pad.left + plotW / 2} y1={pad.top} x2={pad.left + plotW / 2} y2={pad.top + plotH} stroke="hsl(220 20% 18%)" strokeWidth="1" strokeDasharray="4 4" style={{ pointerEvents: 'none' }} />
              <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="hsl(220 20% 16%)" strokeWidth="1" rx="4" style={{ pointerEvents: 'none' }} />

              <text x={pad.left + plotW / 4} y={pad.top + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={RISK_COLORS.Elevated} filter="url(#glow)" style={{ pointerEvents: 'none' }}>ELEVATED</text>
              <text x={pad.left + 3 * plotW / 4} y={pad.top + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={RISK_COLORS.Critical} filter="url(#glow)" style={{ pointerEvents: 'none' }}>CRITICAL</text>
              <text x={pad.left + plotW / 4} y={pad.top + plotH - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={RISK_COLORS.Standard} filter="url(#glow)" style={{ pointerEvents: 'none' }}>STANDARD</text>
              <text x={pad.left + 3 * plotW / 4} y={pad.top + plotH - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={RISK_COLORS.Operational} filter="url(#glow)" style={{ pointerEvents: 'none' }}>OPERATIONAL</text>

              <text x={pad.left + plotW / 2} y={svgH - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(210 40% 60%)" opacity="0.6" style={{ pointerEvents: 'none' }}>Execution Authority</text>
              <text x={10} y={pad.top + plotH / 2} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(210 40% 60%)" opacity="0.6" transform={`rotate(-90, 10, ${pad.top + plotH / 2})`} style={{ pointerEvents: 'none' }}>Stakeholder Exposure</text>

              {visiblePoints.map((point, idx) => {
                const cx = pad.left + (point.x / 100) * plotW;
                const cy = pad.top + plotH - (point.y / 100) * plotH;
                const color = COMPANY_COLORS[point.company];
                const isHl = highlightedCompany === point.company;
                const isSel = selectedPoint?.id === point.id;
                const labelLen = point.label.length * 5 + 14;
                const pointQuadrant: QuadrantKey = point.x >= 50 && point.y >= 50 ? 'critical' : point.x < 50 && point.y >= 50 ? 'elevated' : point.x >= 50 && point.y < 50 ? 'operational' : 'standard';
                const isDimmedByQuadrant = selectedQuadrant && selectedQuadrant !== pointQuadrant;
                return (
                  <g key={point.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePointClick(point); }} data-testid={`risk-point-${point.id}`}>
                    {(isHl || isSel) && (
                      <>
                        <ellipse cx={cx} cy={cy} rx={labelLen / 2 + 6} ry={14} fill="none" stroke={color} strokeWidth="1" opacity="0.3" filter="url(#glow)" />
                        <ellipse cx={cx} cy={cy} rx={labelLen / 2 + 12} ry={18} fill="none" stroke={color} strokeWidth="0.5" opacity="0.15" />
                      </>
                    )}
                    <motion.rect
                      x={cx - labelLen / 2} y={cy - 9} width={labelLen} height={18} rx={9}
                      fill={color}
                      fillOpacity={isDimmedByQuadrant ? 0.15 : isHl || isSel ? 1 : 0.85}
                      stroke={isSel ? '#fff' : 'none'}
                      strokeWidth={isSel ? 1.5 : 0}
                      filter={isDimmedByQuadrant ? undefined : 'url(#point-glow)'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, fillOpacity: isDimmedByQuadrant ? 0.15 : isHl || isSel ? 1 : highlightedCompany ? 0.2 : 0.85 }}
                      transition={{ delay: idx * 0.03, duration: 0.4, type: 'spring', stiffness: 200 }}
                    />
                    <motion.text
                      x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isDimmedByQuadrant ? 0.15 : highlightedCompany && !isHl && !isSel ? 0.2 : 1 }}
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
          <div className="flex flex-wrap gap-3 justify-center mt-1 flex-shrink-0">
            {selectedCompanies.map(company => (
              <button
                key={company}
                className="flex items-center gap-1.5 text-[10px] cursor-pointer transition-opacity"
                style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.2 : 1 }}
                onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                data-testid={`risk-legend-${company.replace(/\s/g, '-')}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 6px ${COMPANY_COLORS[company]}60` }} />
                <span className="text-muted-foreground/60">{company}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <AnimatePresence mode="wait">
            {activeQuadrantInfo ? (
              <motion.div
                key={`quadrant-${selectedQuadrant}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <div className="glass-card-elevated rounded-xl" style={{ boxShadow: `0 0 24px ${activeQuadrantInfo.color}15, inset 0 0 0 1px ${activeQuadrantInfo.color}25` }}>
                  <div className="p-3 border-b border-border/20">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: activeQuadrantInfo.color + '15' }}>
                          <activeQuadrantInfo.icon className="w-4 h-4" style={{ color: activeQuadrantInfo.color, filter: `drop-shadow(0 0 4px ${activeQuadrantInfo.color}60)` }} />
                        </div>
                        <div>
                          <span className="text-xs font-bold" style={{ color: activeQuadrantInfo.color }}>{activeQuadrantInfo.title}</span>
                          <p className="text-[9px] text-muted-foreground/40">{activeQuadrantInfo.axisDescription}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground/50" onClick={() => setSelectedQuadrant(null)} data-testid="button-close-quadrant-detail"><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2.5">
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{activeQuadrantInfo.meaning}</p>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 mb-0.5">Governance Response</p>
                      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{activeQuadrantInfo.governanceResponse}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 mb-1">Required Controls</p>
                      <div className="flex flex-wrap gap-1">
                        {activeQuadrantInfo.controls.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] no-default-active-elevate px-1.5 py-0.5" style={{ borderColor: activeQuadrantInfo.color + '25', color: activeQuadrantInfo.color + 'CC' }}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                    {quadrantPointsList.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/50 mb-1">Systems in this quadrant ({quadrantPointsList.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {quadrantPointsList.map(p => (
                            <Badge
                              key={p.id}
                              className="text-[9px] no-default-active-elevate px-1.5 py-0.5 cursor-pointer"
                              style={{ backgroundColor: COMPANY_COLORS[p.company] + '20', color: COMPANY_COLORS[p.company], border: `1px solid ${COMPANY_COLORS[p.company]}30` }}
                              onClick={() => { setSelectedPoint(p); setSelectedQuadrant(null); }}
                              data-testid={`quadrant-system-${p.id}`}
                            >
                              {p.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : selectedPoint && selectedClassification ? (
              <motion.div
                key={`point-${selectedPoint.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <div className="glass-card-elevated rounded-xl" style={{ boxShadow: `0 0 24px ${selectedClassification.color}12, inset 0 0 0 1px ${selectedClassification.color}20` }}>
                  <div className="p-3 border-b border-border/20">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold">{selectedPoint.label}</span>
                      <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground/50" onClick={() => setSelectedPoint(null)} data-testid="button-close-risk-detail"><X className="w-3.5 h-3.5" /></Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => { const TIcon = TIER_ICONS[selectedClassification.icon]; return <TIcon className="w-3.5 h-3.5" style={{ color: selectedClassification.color, filter: `drop-shadow(0 0 3px ${selectedClassification.color}60)` }} />; })()}
                      <Badge className="no-default-active-elevate text-[9px]" style={{ backgroundColor: selectedClassification.color + '15', color: selectedClassification.color, border: `1px solid ${selectedClassification.color}25` }}>{selectedClassification.tier}</Badge>
                      <span className="text-[10px] text-muted-foreground/40">{selectedPoint.company}</span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{selectedPoint.description}</p>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground/50 mb-1">Required Controls</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPoint.controls.concat(selectedClassification.controls.slice(0, 3)).map((c, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] no-default-active-elevate px-1.5 py-0.5" style={{ borderColor: selectedClassification.color + '20', color: selectedClassification.color + 'CC' }}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="glass-card rounded-xl p-3 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0 mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Risk Weight / Domain</span>
              <span className="text-[9px] text-muted-foreground/30 font-mono">0-5</span>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskWeightData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: 'hsl(215 20% 40%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="domain" width={70} tick={{ fill: 'hsl(210 40% 65%)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(220 22% 9%)', border: '1px solid hsl(220 20% 16%)', borderRadius: 8, fontSize: 11, color: 'hsl(210 40% 90%)', boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)' }}
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
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 flex-shrink-0">
              {riskWeightData.map(d => (
                <span key={d.domain} className="flex items-center gap-1 text-[9px] text-muted-foreground/40">
                  <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color, boxShadow: `0 0 3px ${d.color}40` }} />
                  {d.domain}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Governance Standards</span>
              <span className="text-[9px] text-muted-foreground/30 font-mono">{riskDomainStandards.reduce((s, d) => s + d.requirements.length, 0)} reqs</span>
            </div>
            <div className="space-y-1 max-h-[140px] overflow-y-auto">
              {riskDomainStandards.map(d => {
                const DIcon = DOMAIN_ICONS[d.domain] || Shield;
                const domainColor = DOMAIN_COLORS[d.domain] || '#22D3EE';
                const avgW = d.requirements.reduce((s, r) => s + r.riskWeight, 0) / d.requirements.length;
                return (
                  <div key={d.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/3 transition-colors" data-testid={`domain-${d.id}`}>
                    <DIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: domainColor }} />
                    <span className="text-[11px] flex-1 truncate text-muted-foreground/70">{d.domain}</span>
                    <span className="text-[10px] font-mono" style={{ color: domainColor }}>{d.requirements.length}</span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(220 20% 12%)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(avgW / 5) * 100}%`, backgroundColor: domainColor, boxShadow: `0 0 4px ${domainColor}50` }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/30 w-5 text-right">{avgW.toFixed(1)}</span>
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
