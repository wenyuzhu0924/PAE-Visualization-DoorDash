import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, COMPANY_COLORS, riskPoints,
  type Company, type RiskPoint,
} from '@/lib/data';

function classifyRiskTier(x: number, y: number): { tier: string; color: string; controls: string[] } {
  if (x >= 50 && y >= 50) return {
    tier: 'Critical Risk',
    color: 'hsl(0 84% 45%)',
    controls: ['Exec sign-off', 'Full red-team + audit', 'Immutable audit trails', 'Real-time monitoring', 'Kill-switch', 'Fairness audits'],
  };
  if (x < 50 && y >= 50) return {
    tier: 'Elevated Risk',
    color: 'hsl(27 87% 50%)',
    controls: ['Cross-functional review', 'Enhanced oversight', 'Escalation protocols', 'Disparity monitoring'],
  };
  if (x >= 50 && y < 50) return {
    tier: 'Operational Risk',
    color: 'hsl(217 91% 48%)',
    controls: ['Tech safeguards', 'Auto monitoring', 'Periodic review', 'Circuit breakers'],
  };
  return {
    tier: 'Standard Risk',
    color: 'hsl(142 76% 36%)',
    controls: ['Standard practices', 'Basic monitoring', 'Regular check-ins'],
  };
}

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

  const svgW = 600;
  const svgH = 500;
  const pad = { top: 40, right: 40, bottom: 50, left: 60 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Companies</p>
          <CompanyChips
            companies={COMPANIES}
            selected={selectedCompanies}
            onToggle={(c) => dispatch({ type: 'TOGGLE_COMPANY', company: c })}
            highlighted={highlightedCompany}
            onHighlight={(c) => dispatch({ type: 'SET_HIGHLIGHTED', company: c })}
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer" data-testid="toggle-doordash-layer">
            <Switch checked={showDoorDash} onCheckedChange={setShowDoorDash} />
            <span>DoorDash</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer" data-testid="toggle-competitor-layer">
            <Switch checked={showCompetitors} onCheckedChange={setShowCompetitors} />
            <span>Competitors</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Critical', count: quadrantCounts.critical, color: 'hsl(0 84% 45%)' },
          { label: 'Elevated', count: quadrantCounts.elevated, color: 'hsl(27 87% 50%)' },
          { label: 'Operational', count: quadrantCounts.operational, color: 'hsl(217 91% 48%)' },
          { label: 'Standard', count: quadrantCounts.standard, color: 'hsl(142 76% 36%)' },
        ].map(q => (
          <div key={q.label} className="rounded-md border p-2 flex items-center gap-2" data-testid={`quadrant-count-${q.label.toLowerCase()}`}>
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: q.color }} />
            <span className="text-lg font-bold" style={{ color: q.color }}>{q.count}</span>
            <span className="text-xs text-muted-foreground">{q.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Card>
            <CardContent className="pt-4">
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[700px] mx-auto" style={{ fontFamily: 'var(--font-sans)' }}>
                  <defs>
                    <linearGradient id="q-tl" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(27 87% 50%)" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="hsl(27 87% 50%)" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="q-tr" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(0 84% 45%)" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="hsl(0 84% 45%)" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="q-bl" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity="0.08" />
                    </linearGradient>
                    <linearGradient id="q-br" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 48%)" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="hsl(217 91% 48%)" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>

                  <rect x={pad.left} y={pad.top} width={plotW / 2} height={plotH / 2} fill="url(#q-tl)" />
                  <rect x={pad.left + plotW / 2} y={pad.top} width={plotW / 2} height={plotH / 2} fill="url(#q-tr)" />
                  <rect x={pad.left} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2} fill="url(#q-bl)" />
                  <rect x={pad.left + plotW / 2} y={pad.top + plotH / 2} width={plotW / 2} height={plotH / 2} fill="url(#q-br)" />

                  <line x1={pad.left} y1={pad.top + plotH / 2} x2={pad.left + plotW} y2={pad.top + plotH / 2} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={pad.left + plotW / 2} y1={pad.top} x2={pad.left + plotW / 2} y2={pad.top + plotH} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />

                  <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />

                  <text x={pad.left + plotW / 4} y={pad.top + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(27 87% 50%)">ELEVATED</text>
                  <text x={pad.left + 3 * plotW / 4} y={pad.top + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(0 84% 45%)">CRITICAL</text>
                  <text x={pad.left + plotW / 4} y={pad.top + plotH - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(142 76% 36%)">STANDARD</text>
                  <text x={pad.left + 3 * plotW / 4} y={pad.top + plotH - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(217 91% 48%)">OPERATIONAL</text>

                  <text x={pad.left + plotW / 2} y={svgH - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">Execution Authority</text>
                  <text x={pad.left - 4} y={svgH - 18} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">Assistive</text>
                  <text x={pad.left + plotW + 4} y={svgH - 18} textAnchor="start" fontSize="9" fill="hsl(var(--muted-foreground))">Autonomous</text>

                  <text x={12} y={pad.top + plotH / 2} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--foreground))" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>Stakeholder Exposure</text>
                  <text x={pad.left - 8} y={pad.top + plotH + 4} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">Low</text>
                  <text x={pad.left - 8} y={pad.top + 10} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">High</text>

                  {visiblePoints.map((point, idx) => {
                    const cx = pad.left + (point.x / 100) * plotW;
                    const cy = pad.top + plotH - (point.y / 100) * plotH;
                    const color = COMPANY_COLORS[point.company];
                    const isHl = highlightedCompany === point.company;
                    const isSel = selectedPoint?.id === point.id;
                    const labelLen = point.label.length * 5.5 + 16;
                    return (
                      <g key={point.id} className="cursor-pointer" onClick={() => setSelectedPoint(isSel ? null : point)}>
                        <motion.rect
                          x={cx - labelLen / 2}
                          y={cy - 10}
                          width={labelLen}
                          height={20}
                          rx={10}
                          fill={color}
                          fillOpacity={isHl || isSel ? 1 : 0.85}
                          stroke={isSel ? 'hsl(var(--foreground))' : 'none'}
                          strokeWidth={isSel ? 2 : 0}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, fillOpacity: isHl || isSel ? 1 : highlightedCompany ? 0.3 : 0.85 }}
                          transition={{ delay: idx * 0.04, duration: 0.4, type: 'spring', stiffness: 200 }}
                        />
                        <motion.text
                          x={cx}
                          y={cy + 3.5}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="#fff"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: highlightedCompany && !isHl && !isSel ? 0.3 : 1 }}
                          transition={{ delay: idx * 0.04 + 0.1 }}
                          style={{ pointerEvents: 'none' }}
                        >
                          {point.label}
                        </motion.text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {selectedCompanies.map(company => (
                  <button
                    key={company}
                    className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
                    style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.4 : 1 }}
                    onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                    {company}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {selectedPoint && selectedClassification && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-72 flex-shrink-0"
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMPANY_COLORS[selectedPoint.company] }} />
                      {selectedPoint.label}
                    </CardTitle>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedPoint(null)} data-testid="button-close-risk-detail">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className="no-default-active-elevate"
                      style={{ backgroundColor: selectedClassification.color, color: '#fff' }}
                    >
                      {selectedClassification.tier}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{selectedPoint.company}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Required Controls</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedClassification.controls.map((control, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] no-default-active-elevate"
                            style={{ borderColor: selectedClassification.color + '60', color: selectedClassification.color }}
                          >
                            {control}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedPoint.controls.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">System-Specific</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedPoint.controls.map((control, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] no-default-active-elevate"
                            >
                              {control}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
