import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { X, Info, Shield, AlertTriangle, Zap, Building2, Handshake, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  techTags, type Company, type Domain, type TechTag,
} from '@/lib/data';

const AUTONOMY_CONFIG: Record<string, { bg: string; border: string; glow: string; Icon: typeof Shield }> = {
  Assistive: { bg: 'hsl(199 89% 48% / 0.06)', border: 'hsl(199 89% 48% / 0.25)', glow: 'hsl(199 89% 48%)', Icon: Shield },
  Conditional: { bg: 'hsl(27 87% 50% / 0.08)', border: 'hsl(27 87% 50% / 0.3)', glow: 'hsl(27 87% 50%)', Icon: AlertTriangle },
  Autonomous: { bg: 'hsl(0 84% 55% / 0.08)', border: 'hsl(0 84% 55% / 0.3)', glow: 'hsl(0 84% 55%)', Icon: Zap },
};

const STATUS_DOT: Record<string, string> = {
  Live: 'hsl(142 76% 45%)',
  Pilot: 'hsl(27 87% 55%)',
};

const SOURCE_CONFIG: Record<string, { icon: typeof Building2; color: string }> = {
  'In-house': { icon: Building2, color: 'hsl(199 89% 48%)' },
  Partner: { icon: Handshake, color: 'hsl(280 65% 65%)' },
  Mixed: { icon: Shuffle, color: 'hsl(27 87% 55%)' },
};

interface CellDetail {
  company: Company;
  domain: Domain;
  tags: TechTag[];
}

export function CompetitorTechMap() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, selectedDomains, highlightedCompany } = state;
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const techStats = useMemo(() => {
    const stats = { total: 0, autonomous: 0, conditional: 0, assistive: 0, inHouse: 0, partner: 0, mixed: 0, live: 0, pilot: 0 };
    selectedCompanies.forEach(c => {
      selectedDomains.forEach(d => {
        techTags[c][d].forEach(t => {
          stats.total++;
          if (t.autonomy === 'Autonomous') stats.autonomous++;
          else if (t.autonomy === 'Conditional') stats.conditional++;
          else stats.assistive++;
          if (t.source === 'In-house') stats.inHouse++;
          else if (t.source === 'Partner') stats.partner++;
          else stats.mixed++;
          if (t.status === 'Live') stats.live++;
          else stats.pilot++;
        });
      });
    });
    return stats;
  }, [selectedCompanies, selectedDomains]);

  const sourceBreakdown = useMemo(() => [
    { label: 'In-house', count: techStats.inHouse, color: 'hsl(199 89% 48%)', Icon: Building2, desc: 'Built internally' },
    { label: 'Partner', count: techStats.partner, color: 'hsl(280 65% 65%)', Icon: Handshake, desc: 'External vendor' },
    { label: 'Mixed', count: techStats.mixed, color: 'hsl(27 87% 55%)', Icon: Shuffle, desc: 'Joint development' },
  ], [techStats]);

  const tierBreakdown = useMemo(() => [
    { label: 'Assistive', count: techStats.assistive, color: 'hsl(199 89% 48%)', Icon: Shield, desc: 'Human decides' },
    { label: 'Conditional', count: techStats.conditional, color: 'hsl(27 87% 55%)', Icon: AlertTriangle, desc: 'AI decides w/ limits' },
    { label: 'Autonomous', count: techStats.autonomous, color: 'hsl(0 84% 55%)', Icon: Zap, desc: 'AI decides alone' },
  ], [techStats]);

  const companySystemCounts = useMemo(() => {
    return selectedCompanies.map(c => {
      let count = 0;
      selectedDomains.forEach(d => { count += techTags[c][d].length; });
      return { company: c.split(' ')[0], fullName: c, count, color: COMPANY_COLORS[c] };
    }).sort((a, b) => b.count - a.count);
  }, [selectedCompanies, selectedDomains]);

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

      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {[
          { icon: Zap, label: 'Total', value: techStats.total, color: 'hsl(199 89% 48%)', glow: '' },
          { icon: Zap, label: 'Autonomous', value: techStats.autonomous, color: 'hsl(0 84% 55%)', glow: 'glow-border-red' },
          { icon: Shield, label: 'Live', value: techStats.live, color: 'hsl(142 76% 45%)', glow: 'glow-border-green' },
          { icon: AlertTriangle, label: 'Pilot', value: techStats.pilot, color: 'hsl(27 87% 55%)', glow: 'glow-border-orange' },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-lg p-2 ${s.glow}`} style={!s.glow ? { boxShadow: 'inset 0 0 0 1px hsl(199 89% 48% / 0.15)' } : undefined}>
            <div className="flex items-center gap-1.5">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-bold ml-auto" style={{ color: s.color }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="flex gap-2 flex-1 min-h-0">
            <div className="flex-1 min-w-0 min-h-0 overflow-auto">
              <div className="h-full min-w-[600px]">
                <div className="grid gap-px h-full" style={{ gridTemplateColumns: `80px repeat(${selectedDomains.length}, 1fr)`, gridTemplateRows: `28px repeat(${selectedCompanies.length}, 1fr)` }}>
                  <div />
                  {selectedDomains.map(domain => (
                    <div key={domain} className="flex items-end justify-center pb-1 text-xs font-semibold text-muted-foreground/80 text-center">
                      {domain.replace(' AI', '').replace('Autonomous ', '')}
                    </div>
                  ))}
                  {selectedCompanies.map(company => {
                    const isHighlighted = highlightedCompany === company;
                    return [
                      <div
                        key={`label-${company}`}
                        className="flex items-center gap-1.5 pr-1"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 5px ${COMPANY_COLORS[company]}40` }} />
                        <span className="text-[11px] font-medium text-muted-foreground leading-tight">{company}</span>
                      </div>,
                      ...selectedDomains.map(domain => {
                        const tags = techTags[company][domain];
                        const isSelected = selectedCell?.company === company && selectedCell?.domain === domain;
                        return (
                          <motion.div
                            key={`${company}-${domain}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-md cursor-pointer transition-all duration-200 glass-card flex flex-col justify-center p-1"
                            style={{
                              borderColor: isHighlighted ? COMPANY_COLORS[company] + '50' : isSelected ? 'hsl(199 89% 48% / 0.4)' : undefined,
                              borderWidth: isHighlighted || isSelected ? 1 : undefined,
                              boxShadow: isSelected ? '0 0 15px hsl(199 89% 48% / 0.15)' : isHighlighted ? `0 0 10px ${COMPANY_COLORS[company]}20` : undefined,
                            }}
                            onClick={() => setSelectedCell(isSelected ? null : { company, domain, tags })}
                            data-testid={`cell-${company.replace(/\s/g, '-')}-${domain.replace(/\s/g, '-')}`}
                          >
                            <div className="space-y-0.5">
                              {tags.map(tag => {
                                const ac = AUTONOMY_CONFIG[tag.autonomy];
                                const TierIcon = ac.Icon;
                                return (
                                  <div
                                    key={tag.label}
                                    className="flex items-center gap-1 rounded px-1 py-0.5"
                                    style={{ backgroundColor: ac.bg, borderLeft: `2px solid ${ac.border}` }}
                                  >
                                    <TierIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ac.glow }} />
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[tag.status] }} />
                                    <span className="text-[11px] font-semibold leading-tight">{tag.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      }),
                    ];
                  })}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedCell && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="w-64 flex-shrink-0"
                >
                  <div className="glass-card rounded-xl glow-border-blue h-full">
                    <div className="p-2.5 border-b border-border/30">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[selectedCell.company] }} />
                          {selectedCell.company}
                        </div>
                        <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setSelectedCell(null)} data-testid="button-close-detail">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedCell.domain}</p>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3 p-2.5">
                        {selectedCell.tags.map(tag => {
                          const ac = AUTONOMY_CONFIG[tag.autonomy];
                          const SrcCfg = SOURCE_CONFIG[tag.source];
                          return (
                            <div key={tag.label} className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <ac.Icon className="w-3.5 h-3.5" style={{ color: ac.glow }} />
                                <span className="font-semibold text-xs">{tag.label}</span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] no-default-active-elevate border-border/50 px-1.5">
                                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: STATUS_DOT[tag.status] }} />
                                  {tag.status}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] no-default-active-elevate border-border/50 px-1.5">
                                  <SrcCfg.icon className="w-2.5 h-2.5 mr-1" style={{ color: SrcCfg.color }} />
                                  {tag.source}
                                </Badge>
                                <Badge className="text-[10px] no-default-active-elevate px-1.5" style={{ backgroundColor: ac.bg, color: ac.glow, border: `1px solid ${ac.border}` }}>
                                  {tag.autonomy}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{tag.description}</p>
                              <div className="flex items-start gap-1.5 p-2 rounded-md" style={{ backgroundColor: 'hsl(0 84% 55% / 0.06)', border: '1px solid hsl(0 84% 55% / 0.12)' }}>
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0 84% 55%)' }} />
                                <p className="text-[11px]" style={{ color: 'hsl(0 84% 70%)' }}>{tag.riskNote}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 flex-shrink-0 mt-1">
            {Object.entries(AUTONOMY_CONFIG).map(([tier, cfg]) => (
              <span key={tier} className="flex items-center gap-1">
                <cfg.Icon className="w-3 h-3" style={{ color: cfg.glow }} />
                {tier}
              </span>
            ))}
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Live }} />Live</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Pilot }} />Pilot</span>
          </div>
        </div>

        <div className="w-56 flex-shrink-0 flex flex-col gap-2 min-h-0">
          <div className="glass-card rounded-xl p-2.5 flex-1 min-h-0 flex flex-col" data-testid="panel-systems-company">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Systems / Company</span>
            <div className="flex-1 min-h-0 flex items-center">
              <div className="relative w-full" style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={companySystemCounts}
                      dataKey="count"
                      nameKey="company"
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={52}
                      paddingAngle={3}
                      strokeWidth={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {companySystemCounts.map((c) => (
                        <Cell key={c.fullName} fill={c.color} style={{ filter: `drop-shadow(0 0 4px ${c.color}50)` }} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(222 22% 11%)', border: '1px solid hsl(217 20% 20%)', borderRadius: 8, fontSize: 11, color: 'hsl(210 40% 90%)' }}
                      formatter={(value: number, name: string) => [`${value} systems`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary leading-none">{techStats.total}</p>
                    <p className="text-[9px] text-muted-foreground/60 uppercase">total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 flex-shrink-0">
              {companySystemCounts.map((c) => (
                <div key={c.fullName} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, boxShadow: `0 0 4px ${c.color}40` }} />
                  <span className="text-[11px] text-muted-foreground flex-1 truncate">{c.company}</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color: c.color }}>{c.count}</span>
                  <span className="text-[10px] text-muted-foreground/40 w-7 text-right">{techStats.total > 0 ? Math.round((c.count / techStats.total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex-shrink-0" data-testid="panel-build-source">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Build Source</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceBreakdown.filter(s => s.count > 0)}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={28}
                      paddingAngle={4}
                      strokeWidth={0}
                      animationDuration={800}
                    >
                      {sourceBreakdown.filter(s => s.count > 0).map((s) => (
                        <Cell key={s.label} fill={s.color} style={{ filter: `drop-shadow(0 0 3px ${s.color}40)` }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {sourceBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <s.Icon className="w-3 h-3 flex-shrink-0" style={{ color: s.color }} />
                    <span className="text-[10px] text-muted-foreground flex-1">{s.label}</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex-shrink-0" data-testid="panel-autonomy-level">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Autonomy Level</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierBreakdown.filter(t => t.count > 0)}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={28}
                      paddingAngle={4}
                      strokeWidth={0}
                      animationDuration={800}
                    >
                      {tierBreakdown.filter(t => t.count > 0).map((t) => (
                        <Cell key={t.label} fill={t.color} style={{ filter: `drop-shadow(0 0 3px ${t.color}40)` }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {tierBreakdown.map((t) => (
                  <div key={t.label} className="flex items-center gap-1">
                    <t.Icon className="w-3 h-3 flex-shrink-0" style={{ color: t.color }} />
                    <span className="text-[10px] text-muted-foreground flex-1">{t.label}</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: t.color }}>{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
