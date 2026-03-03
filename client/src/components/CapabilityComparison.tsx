import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  capabilityScores,
  type Company, type Domain,
} from '@/lib/data';

const SCORE_COLORS = [
  'hsl(217 20% 15%)',
  'hsl(217 30% 22%)',
  'hsl(199 50% 28%)',
  'hsl(199 70% 35%)',
  'hsl(199 80% 42%)',
  'hsl(199 89% 48%)',
];

function getScoreColor(score: number): string {
  return SCORE_COLORS[Math.min(score, 5)];
}

interface InsightCard {
  icon: 'trophy' | 'trending' | 'alert' | 'shield';
  value: string;
  label: string;
  color: string;
}

function getInsightCards(selectedCompanies: Company[], selectedDomains: Domain[]): InsightCard[] {
  if (selectedCompanies.length === 0 || selectedDomains.length === 0) return [];

  const cards: InsightCard[] = [];

  const scores = selectedCompanies.map(c => ({
    company: c,
    avg: selectedDomains.reduce((sum, d) => sum + capabilityScores[c][d], 0) / selectedDomains.length,
  }));

  const leader = scores.reduce((a, b) => a.avg > b.avg ? a : b);
  cards.push({
    icon: 'trophy',
    value: leader.company,
    label: `${leader.avg.toFixed(1)}/5 avg score`,
    color: COMPANY_COLORS[leader.company],
  });

  const maxScoreDomains = selectedDomains.filter(d =>
    selectedCompanies.some(c => capabilityScores[c][d] === 5)
  );
  if (maxScoreDomains.length > 0) {
    cards.push({
      icon: 'trending',
      value: `${maxScoreDomains.length} at max`,
      label: `domain${maxScoreDomains.length > 1 ? 's' : ''} scoring 5/5`,
      color: 'hsl(199 89% 48%)',
    });
  }

  const laggard = scores.reduce((a, b) => a.avg < b.avg ? a : b);
  if (laggard.company !== leader.company) {
    const gap = leader.avg - laggard.avg;
    cards.push({
      icon: 'alert',
      value: `${gap.toFixed(1)} pt gap`,
      label: `${leader.company.split(' ')[0]} vs ${laggard.company.split(' ')[0]}`,
      color: 'hsl(27 87% 55%)',
    });
  }

  if (selectedDomains.includes('Dispatch AI') && selectedDomains.includes('Support AI')) {
    cards.push({
      icon: 'shield',
      value: 'Compound',
      label: 'Dispatch + Support risk',
      color: 'hsl(0 84% 55%)',
    });
  }

  return cards.slice(0, 4);
}

const ICON_MAP = {
  trophy: Trophy,
  trending: TrendingUp,
  alert: AlertTriangle,
  shield: Shield,
};

export function CapabilityComparison() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, selectedDomains, highlightedCompany } = state;

  const radarData = useMemo(() => {
    return selectedDomains.map(domain => {
      const point: Record<string, string | number> = { domain: domain.replace(' AI', '').replace('Autonomous ', '') };
      selectedCompanies.forEach(company => {
        point[company] = capabilityScores[company][domain];
      });
      return point;
    });
  }, [selectedCompanies, selectedDomains]);

  const insightCards = useMemo(
    () => getInsightCards(selectedCompanies, selectedDomains),
    [selectedCompanies, selectedDomains]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CompanyChips
          companies={COMPANIES}
          selected={selectedCompanies}
          onToggle={(c) => dispatch({ type: 'TOGGLE_COMPANY', company: c })}
          highlighted={highlightedCompany}
          onHighlight={(c) => dispatch({ type: 'SET_HIGHLIGHTED', company: c })}
        />
        <DomainChips
          domains={DOMAINS}
          selected={selectedDomains}
          onToggle={(d) => dispatch({ type: 'TOGGLE_DOMAIN', domain: d })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2" data-testid="auto-insights">
        <AnimatePresence mode="popLayout">
          {insightCards.map((card, i) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <motion.div
                key={`${card.icon}-${card.value}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                className="glass-card rounded-lg p-3 flex items-center gap-3"
                style={{ boxShadow: `0 0 15px ${card.color}10, inset 0 0 0 1px ${card.color}20` }}
                data-testid={`insight-card-${i}`}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight truncate">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="glass-card rounded-xl p-4 glow-border-blue">
          <div className="w-full" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid strokeDasharray="3 3" stroke="hsl(217 20% 20%)" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: 'hsl(210 40% 80%)', fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tickCount={6}
                  tick={{ fill: 'hsl(215 20% 40%)', fontSize: 10 }}
                  axisLine={false}
                />
                {selectedCompanies.map(company => (
                  <Radar
                    key={company}
                    name={company}
                    dataKey={company}
                    stroke={COMPANY_COLORS[company]}
                    fill={COMPANY_COLORS[company]}
                    fillOpacity={highlightedCompany === company ? 0.4 : highlightedCompany ? 0.05 : 0.15}
                    strokeWidth={highlightedCompany === company ? 3 : highlightedCompany ? 1 : 2}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                ))}
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222 22% 11%)',
                    border: '1px solid hsl(217 20% 20%)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'hsl(210 40% 90%)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {selectedCompanies.map(company => (
              <button
                key={company}
                className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
                style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.3 : 1 }}
                onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                data-testid={`legend-${company.replace(/\s/g, '-')}`}
              >
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 6px ${COMPANY_COLORS[company]}60` }}
                />
                <span className="text-muted-foreground">{company}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="heatmap-table">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground text-xs"></th>
                  {selectedDomains.map(domain => (
                    <th key={domain} className="text-center py-2 px-2 font-medium text-xs text-muted-foreground" style={{ minWidth: 70 }}>
                      {domain.replace(' AI', '').replace('Autonomous ', '')}
                    </th>
                  ))}
                  <th className="text-center py-2 px-2 font-medium text-xs text-muted-foreground">Avg</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {selectedCompanies.map(company => {
                    const avg = selectedDomains.reduce((s, d) => s + capabilityScores[company][d], 0) / selectedDomains.length;
                    const isHighlighted = highlightedCompany === company;
                    return (
                      <motion.tr
                        key={company}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="cursor-pointer"
                        style={{ outline: isHighlighted ? `1px solid ${COMPANY_COLORS[company]}40` : 'none', borderRadius: 4 }}
                        onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: isHighlighted ? null : company })}
                        data-testid={`heatmap-row-${company.replace(/\s/g, '-')}`}
                      >
                        <td className="py-1.5 pr-3 font-medium text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                            <span className="text-muted-foreground">{company}</span>
                          </span>
                        </td>
                        {selectedDomains.map(domain => {
                          const score = capabilityScores[company][domain];
                          return (
                            <td key={domain} className="text-center py-1.5 px-1">
                              <motion.div
                                className="mx-auto rounded-md flex items-center justify-center font-bold text-xs"
                                style={{
                                  width: 36, height: 28,
                                  backgroundColor: getScoreColor(score),
                                  color: score >= 3 ? '#fff' : 'hsl(210 40% 70%)',
                                  boxShadow: score >= 4 ? `0 0 8px ${getScoreColor(score)}40` : 'none',
                                }}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {score}
                              </motion.div>
                            </td>
                          );
                        })}
                        <td className="text-center py-1.5 px-1">
                          <div
                            className="mx-auto rounded-md flex items-center justify-center font-bold text-xs"
                            style={{
                              width: 36, height: 28,
                              border: `1px dashed ${COMPANY_COLORS[company]}50`,
                              color: COMPANY_COLORS[company],
                            }}
                          >
                            {avg.toFixed(1)}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-1 mt-3 justify-center">
            <span className="text-[10px] text-muted-foreground mr-1">Low</span>
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className="w-5 h-3.5 rounded-sm flex items-center justify-center text-[9px]"
                style={{ backgroundColor: getScoreColor(s), color: s >= 3 ? '#fff' : 'hsl(210 40% 70%)' }}
              >
                {s}
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
