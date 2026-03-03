import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  capabilityScores, getAutoInsights,
  type Company, type Domain,
} from '@/lib/data';

const SCORE_COLORS = [
  'hsl(0 0% 90%)',
  'hsl(210 15% 80%)',
  'hsl(210 30% 65%)',
  'hsl(217 60% 50%)',
  'hsl(217 80% 40%)',
  'hsl(217 91% 30%)',
];

function getScoreColor(score: number): string {
  return SCORE_COLORS[Math.min(score, 5)];
}

export function CapabilityComparison() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, selectedDomains, highlightedCompany } = state;

  const radarData = useMemo(() => {
    return selectedDomains.map(domain => {
      const point: Record<string, string | number> = { domain };
      selectedCompanies.forEach(company => {
        point[company] = capabilityScores[company][domain];
      });
      return point;
    });
  }, [selectedCompanies, selectedDomains]);

  const insights = useMemo(
    () => getAutoInsights(selectedCompanies, selectedDomains),
    [selectedCompanies, selectedDomains]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
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
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Capability Domains</p>
          <DomainChips
            domains={DOMAINS}
            selected={selectedDomains}
            onToggle={(d) => dispatch({ type: 'TOGGLE_DOMAIN', domain: d })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Strategic Capability Profile Comparison</CardTitle>
            <p className="text-sm text-muted-foreground">Radar overlay of capability scores (0-5 scale)</p>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 5]}
                    tickCount={6}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                  />
                  {selectedCompanies.map(company => (
                    <Radar
                      key={company}
                      name={company}
                      dataKey={company}
                      stroke={COMPANY_COLORS[company]}
                      fill={COMPANY_COLORS[company]}
                      fillOpacity={highlightedCompany === company ? 0.35 : highlightedCompany ? 0.05 : 0.12}
                      strokeWidth={highlightedCompany === company ? 3 : highlightedCompany ? 1 : 2}
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                  ))}
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 6,
                      fontSize: 12,
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
                  style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.4 : 1 }}
                  onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                  data-testid={`legend-${company.replace(/\s/g, '-')}`}
                >
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COMPANY_COLORS[company] }}
                  />
                  {company}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Capability Maturity Landscape (1-5 Scale)</CardTitle>
            <p className="text-sm text-muted-foreground">Heatmap of scores by company and domain</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="heatmap-table">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground text-xs sticky left-0 bg-card"></th>
                    {selectedDomains.map(domain => (
                      <th key={domain} className="text-center py-2 px-2 font-medium text-xs text-muted-foreground" style={{ minWidth: 80 }}>
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
                          style={{ outline: isHighlighted ? `2px solid ${COMPANY_COLORS[company]}` : 'none', borderRadius: 4 }}
                          onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: isHighlighted ? null : company })}
                          data-testid={`heatmap-row-${company.replace(/\s/g, '-')}`}
                        >
                          <td className="py-2 pr-3 font-medium text-xs sticky left-0 bg-card">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                              {company}
                            </span>
                          </td>
                          {selectedDomains.map(domain => {
                            const score = capabilityScores[company][domain];
                            return (
                              <td key={domain} className="text-center py-2 px-2">
                                <motion.div
                                  className="mx-auto rounded-md flex items-center justify-center font-bold text-xs"
                                  style={{
                                    width: 40, height: 32,
                                    backgroundColor: getScoreColor(score),
                                    color: score >= 4 ? '#fff' : 'hsl(var(--foreground))',
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
                          <td className="text-center py-2 px-2">
                            <div
                              className="mx-auto rounded-md flex items-center justify-center font-bold text-xs border border-dashed"
                              style={{
                                width: 40, height: 32,
                                borderColor: COMPANY_COLORS[company],
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

            <div className="flex items-center gap-1 mt-4 justify-center">
              <span className="text-xs text-muted-foreground mr-1">Low</span>
              {[1, 2, 3, 4, 5].map(s => (
                <div
                  key={s}
                  className="w-6 h-4 rounded-sm flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: getScoreColor(s), color: s >= 4 ? '#fff' : 'hsl(var(--foreground))' }}
                >
                  {s}
                </div>
              ))}
              <span className="text-xs text-muted-foreground ml-1">High</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-chart-2" />
            Auto Insights
          </CardTitle>
          <p className="text-sm text-muted-foreground">Key findings based on selected companies and domains</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2" data-testid="auto-insights">
            <AnimatePresence mode="popLayout">
              {insights.map((insight, i) => (
                <motion.li
                  key={insight}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-2 mt-1.5 flex-shrink-0" />
                  {insight}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
