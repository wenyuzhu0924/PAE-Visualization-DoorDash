import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { Trophy, TrendingUp, Zap, Bot, MessageSquare, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  capabilityScores, techTags, platformMetrics,
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

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {prefix}{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}{suffix}
    </motion.span>
  );
}

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

  const companyAvgs = useMemo(() => {
    return selectedCompanies.map(c => ({
      company: c.split(' ')[0],
      fullName: c,
      avg: selectedDomains.reduce((s, d) => s + capabilityScores[c][d], 0) / selectedDomains.length,
      color: COMPANY_COLORS[c],
    })).sort((a, b) => b.avg - a.avg);
  }, [selectedCompanies, selectedDomains]);

  const autonomyDist = useMemo(() => {
    const dist: Record<string, number> = { Assistive: 0, Conditional: 0, Autonomous: 0 };
    selectedCompanies.forEach(c => {
      selectedDomains.forEach(d => {
        techTags[c][d].forEach(t => { dist[t.autonomy]++; });
      });
    });
    return Object.entries(dist).map(([tier, count]) => ({ tier, count }));
  }, [selectedCompanies, selectedDomains]);

  const leader = companyAvgs[0];
  const totalSystems = useMemo(() => {
    let count = 0;
    selectedCompanies.forEach(c => selectedDomains.forEach(d => { count += techTags[c][d].length; }));
    return count;
  }, [selectedCompanies, selectedDomains]);

  const heroStats = [
    { icon: Bot, label: 'Daily AI Interactions', value: platformMetrics.dailyAIInteractions, suffix: '+', color: 'hsl(199 89% 48%)' },
    { icon: TrendingUp, label: 'Resolution Rate', value: platformMetrics.resolutionRate, suffix: '%', color: 'hsl(142 76% 45%)' },
    { icon: MessageSquare, label: 'Msgs / Min', value: platformMetrics.messagesPerMinute, suffix: '', color: 'hsl(27 87% 55%)' },
    { icon: Globe, label: 'Market 2032', value: platformMetrics.marketSize2032, suffix: 'B', prefix: '$', color: 'hsl(280 65% 65%)' },
  ];

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
        <DomainChips
          domains={DOMAINS}
          selected={selectedDomains}
          onToggle={(d) => dispatch({ type: 'TOGGLE_DOMAIN', domain: d })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-shrink-0" data-testid="hero-stats">
        {heroStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card rounded-lg p-2.5 relative overflow-hidden"
            style={{ boxShadow: `0 0 20px ${stat.color}08, inset 0 0 0 1px ${stat.color}15` }}
            data-testid={`hero-stat-${i}`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.04]" style={{ background: `radial-gradient(circle, ${stat.color}, transparent)` }} />
            <div className="flex items-center gap-1.5 mb-0.5">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-xl font-bold leading-none" style={{ color: stat.color }}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-card rounded-xl p-3 glow-border-blue flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capability Radar</span>
            <span className="text-[11px] text-muted-foreground font-mono">{selectedCompanies.length} companies / {selectedDomains.length} domains</span>
          </div>
          <div className="w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid strokeDasharray="3 3" stroke="hsl(217 20% 20%)" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: 'hsl(210 40% 80%)', fontSize: 12, fontWeight: 600 }}
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
          <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
            {selectedCompanies.map(company => (
              <button
                key={company}
                className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
                style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.3 : 1 }}
                onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                data-testid={`legend-${company.replace(/\s/g, '-')}`}
              >
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 6px ${COMPANY_COLORS[company]}60` }} />
                <span className="text-muted-foreground">{company}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="glass-card rounded-xl p-3 flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rankings</span>
            <div className="mt-2 space-y-1.5">
              {companyAvgs.map((c, i) => (
                <motion.div
                  key={c.fullName}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2"
                  data-testid={`ranking-${i}`}
                >
                  <span className="text-[11px] font-mono text-muted-foreground w-5">#{i + 1}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-xs flex-1 truncate">{c.company}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 4px ${c.color}60` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.avg / 5) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono w-8 text-right" style={{ color: c.color }}>{c.avg.toFixed(1)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 flex-1 min-h-0 flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Autonomy Distribution</span>
            <div className="mt-1 flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={autonomyDist} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 20% 15%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(215 20% 45%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="tier" tick={{ fill: 'hsl(210 40% 80%)', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800}>
                    {autonomyDist.map((entry) => (
                      <Cell
                        key={entry.tier}
                        fill={entry.tier === 'Autonomous' ? 'hsl(0 84% 55%)' : entry.tier === 'Conditional' ? 'hsl(27 87% 55%)' : 'hsl(199 89% 48%)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            <div className="glass-card rounded-lg p-2.5 text-center" data-testid="stat-leader">
              <Trophy className="w-4 h-4 mx-auto mb-1" style={{ color: leader?.color }} />
              <p className="text-xs font-bold truncate" style={{ color: leader?.color }}>{leader?.company}</p>
              <p className="text-[10px] text-muted-foreground">Leader</p>
            </div>
            <div className="glass-card rounded-lg p-2.5 text-center" data-testid="stat-systems">
              <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs font-bold text-primary">{totalSystems}</p>
              <p className="text-[10px] text-muted-foreground">Systems</p>
            </div>
            <div className="glass-card rounded-lg p-2.5 text-center" data-testid="stat-latency">
              <Clock className="w-4 h-4 mx-auto mb-1 text-green-400" />
              <p className="text-xs font-bold text-green-400">{platformMetrics.avgLatency}s</p>
              <p className="text-[10px] text-muted-foreground">Latency</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score Heatmap</span>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground mr-1">Low</span>
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className="w-5 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: getScoreColor(s), color: s >= 3 ? '#fff' : 'hsl(210 40% 70%)' }}
              >
                {s}
              </div>
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">High</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="heatmap-table">
            <thead>
              <tr>
                <th className="text-left py-1 pr-2 font-medium text-muted-foreground text-xs"></th>
                {selectedDomains.map(domain => (
                  <th key={domain} className="text-center py-1 px-1 font-medium text-xs text-muted-foreground" style={{ minWidth: 60 }}>
                    {domain.replace(' AI', '').replace('Autonomous ', '')}
                  </th>
                ))}
                <th className="text-center py-1 px-1 font-medium text-xs text-muted-foreground">Avg</th>
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
                      <td className="py-1 pr-2 font-medium text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                          <span className="text-muted-foreground">{company}</span>
                        </span>
                      </td>
                      {selectedDomains.map(domain => {
                        const score = capabilityScores[company][domain];
                        return (
                          <td key={domain} className="text-center py-1 px-1">
                            <motion.div
                              className="mx-auto rounded flex items-center justify-center font-bold text-xs"
                              style={{
                                width: 32, height: 26,
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
                      <td className="text-center py-1 px-1">
                        <div
                          className="mx-auto rounded flex items-center justify-center font-bold text-xs"
                          style={{
                            width: 32, height: 26,
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
      </div>
    </div>
  );
}
