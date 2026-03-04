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
import { useThemeColors } from '@/lib/themeColors';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS, TIER_COLORS,
  capabilityScores, techTags, platformMetrics,
  type Company, type Domain,
} from '@/lib/data';

const SCORE_COLORS_DARK = [
  'hsl(220 20% 10%)',
  'hsl(220 22% 16%)',
  'hsl(192 40% 22%)',
  'hsl(190 55% 30%)',
  'hsl(188 65% 38%)',
  '#14B8A6',
];

const SCORE_COLORS_LIGHT = [
  'hsl(0 0% 95%)',
  'hsl(0 0% 88%)',
  'hsl(10 50% 78%)',
  'hsl(10 65% 65%)',
  'hsl(10 80% 55%)',
  '#FF3008',
];

function getScoreColor(score: number, isDark: boolean): string {
  const palette = isDark ? SCORE_COLORS_DARK : SCORE_COLORS_LIGHT;
  return palette[Math.min(score, 5)];
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
  const tc = useThemeColors();

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
    { icon: Bot, label: 'AI Interactions', value: platformMetrics.dailyAIInteractions, suffix: '+', color: '#22D3EE' },
    { icon: TrendingUp, label: 'Resolution', value: platformMetrics.resolutionRate, suffix: '%', color: '#14B8A6' },
    { icon: MessageSquare, label: 'Msgs/Min', value: platformMetrics.messagesPerMinute, suffix: '', color: '#EAB308' },
    { icon: Globe, label: 'Mkt 2032', value: platformMetrics.marketSize2032, suffix: 'B', prefix: '$', color: '#818CF8' },
  ];

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
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
            className="glass-card rounded-lg p-2 relative overflow-hidden group"
            style={{ boxShadow: `0 0 24px ${stat.color}06, inset 0 0 0 1px ${stat.color}15` }}
            data-testid={`hero-stat-${i}`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}08, transparent 70%)` }} />
            <div className="flex items-center gap-1.5 mb-0.5">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color, filter: `drop-shadow(0 0 4px ${stat.color}60)` }} />
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <p className="text-lg font-bold leading-none" style={{ color: stat.color }}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        <div className="lg:col-span-2 glass-card rounded-xl p-3 glow-border-blue flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Capability Radar</span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">{selectedCompanies.length}co / {selectedDomains.length}dom</span>
          </div>
          <div className="w-full flex-1 min-h-0 overflow-hidden chart-glow">
            <ResponsiveContainer width="100%" height="100%" key={`radar-${selectedCompanies.length}-${selectedDomains.length}`}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid strokeDasharray="3 3" stroke={tc.chartGridStroke} />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: tc.chartAxisTick, fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tickCount={6}
                  tick={{ fill: tc.chartAxisTickMuted, fontSize: 9 }}
                  axisLine={false}
                />
                {selectedCompanies.map(company => (
                  <Radar
                    key={company}
                    name={company}
                    dataKey={company}
                    stroke={COMPANY_COLORS[company]}
                    fill={COMPANY_COLORS[company]}
                    fillOpacity={highlightedCompany === company ? 0.45 : highlightedCompany ? 0.04 : 0.18}
                    strokeWidth={highlightedCompany === company ? 3 : highlightedCompany ? 1 : 2}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                ))}
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: tc.tooltipBg,
                    border: tc.tooltipBorder,
                    borderRadius: 8,
                    fontSize: 11,
                    color: tc.tooltipColor,
                    boxShadow: tc.tooltipShadow,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
            {selectedCompanies.map(company => (
              <button
                key={company}
                className="flex items-center gap-1.5 text-[11px] cursor-pointer transition-opacity"
                style={{ opacity: highlightedCompany && highlightedCompany !== company ? 0.25 : 1 }}
                onClick={() => dispatch({ type: 'SET_HIGHLIGHTED', company: highlightedCompany === company ? null : company })}
                data-testid={`legend-${company.replace(/\s/g, '-')}`}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 8px ${COMPANY_COLORS[company]}60` }} />
                <span className="text-muted-foreground/70">{company}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="glass-card rounded-xl p-3 min-h-0 flex flex-col overflow-hidden">
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex-shrink-0">Rankings</span>
            <div className="mt-2 space-y-1.5 overflow-y-auto min-h-0">
              {companyAvgs.map((c, i) => (
                <motion.div
                  key={c.fullName}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-2"
                  data-testid={`ranking-${i}`}
                >
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-4">#{i + 1}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}50` }} />
                  <span className="text-xs flex-1 truncate text-muted-foreground/80">{c.company}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: tc.barTrackBg }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}60` }}
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
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest flex-shrink-0">Autonomy Distribution</span>
            <div className="mt-1 flex-1 min-h-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" key={`bar-${selectedCompanies.length}-${selectedDomains.length}`}>
                <BarChart data={autonomyDist} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.barTrackBg} horizontal={false} />
                  <XAxis type="number" tick={{ fill: tc.chartAxisTickMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="tier" tick={{ fill: tc.chartAxisTick, fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800}>
                    {autonomyDist.map((entry) => (
                      <Cell
                        key={entry.tier}
                        fill={entry.tier === 'Autonomous' ? TIER_COLORS.Autonomous : entry.tier === 'Conditional' ? TIER_COLORS.Conditional : TIER_COLORS.Assistive}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            <div className="glass-card rounded-lg p-2 text-center" data-testid="stat-leader">
              <Trophy className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: leader?.color, filter: `drop-shadow(0 0 4px ${leader?.color}60)` }} />
              <p className="text-[11px] font-bold truncate" style={{ color: leader?.color }}>{leader?.company}</p>
              <p className="text-[9px] text-muted-foreground/40">Leader</p>
            </div>
            <div className="glass-card rounded-lg p-2 text-center" data-testid="stat-systems">
              <Zap className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" style={{ filter: tc.primaryFilterGlow }} />
              <p className="text-[11px] font-bold text-primary">{totalSystems}</p>
              <p className="text-[9px] text-muted-foreground/40">Systems</p>
            </div>
            <div className="glass-card rounded-lg p-2 text-center" data-testid="stat-latency">
              <Clock className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#14B8A6', filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.5))' }} />
              <p className="text-[11px] font-bold" style={{ color: '#14B8A6' }}>{platformMetrics.avgLatency}s</p>
              <p className="text-[9px] text-muted-foreground/40">Latency</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3 min-h-0 flex flex-col overflow-hidden" style={{ flex: '0 1 auto', maxHeight: '30%' }}>
        <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Score Heatmap</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground/30 mr-1">Low</span>
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className="w-5 h-3.5 rounded-sm flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor: getScoreColor(s, tc.isDark),
                  color: s >= 3 ? '#fff' : tc.scoreLowText,
                  boxShadow: s >= 4 ? `0 0 6px ${getScoreColor(s, tc.isDark)}40` : 'none',
                }}
              >
                {s}
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground/30 ml-1">High</span>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto min-h-0 flex-1">
          <table className="w-full text-sm" data-testid="heatmap-table">
            <thead>
              <tr>
                <th className="text-left py-1 pr-2 font-medium text-muted-foreground/50 text-[10px]"></th>
                {selectedDomains.map(domain => (
                  <th key={domain} className="text-center py-1 px-1 font-medium text-[10px] text-muted-foreground/50" style={{ minWidth: 55 }}>
                    {domain.replace(' AI', '').replace('Autonomous ', '')}
                  </th>
                ))}
                <th className="text-center py-1 px-1 font-medium text-[10px] text-muted-foreground/50">Avg</th>
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
                      <td className="py-1 pr-2 font-medium text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 4px ${COMPANY_COLORS[company]}40` }} />
                          <span className="text-muted-foreground/70">{company}</span>
                        </span>
                      </td>
                      {selectedDomains.map(domain => {
                        const score = capabilityScores[company][domain];
                        return (
                          <td key={domain} className="text-center py-1 px-1">
                            <motion.div
                              className="mx-auto rounded flex items-center justify-center font-bold text-[11px]"
                              style={{
                                width: 30, height: 24,
                                backgroundColor: getScoreColor(score, tc.isDark),
                                color: score >= 3 ? '#fff' : tc.scoreLowText,
                                boxShadow: score >= 4 ? `0 0 10px ${getScoreColor(score, tc.isDark)}50` : 'none',
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
                          className="mx-auto rounded flex items-center justify-center font-bold text-[11px]"
                          style={{
                            width: 30, height: 24,
                            border: `1px dashed ${COMPANY_COLORS[company]}40`,
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
