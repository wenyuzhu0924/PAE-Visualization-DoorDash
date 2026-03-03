import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { X, Info, Shield, AlertTriangle, Zap, Building2, Handshake, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  techTags, type Company, type Domain, type TechTag,
} from '@/lib/data';

const AUTONOMY_CONFIG: Record<string, { bg: string; border: string; glow: string; Icon: typeof Shield; label: string }> = {
  Assistive: { bg: 'hsl(199 89% 48% / 0.06)', border: 'hsl(199 89% 48% / 0.25)', glow: 'hsl(199 89% 48%)', Icon: Shield, label: 'Assistive' },
  Conditional: { bg: 'hsl(27 87% 50% / 0.08)', border: 'hsl(27 87% 50% / 0.3)', glow: 'hsl(27 87% 50%)', Icon: AlertTriangle, label: 'Conditional' },
  Autonomous: { bg: 'hsl(0 84% 55% / 0.08)', border: 'hsl(0 84% 55% / 0.3)', glow: 'hsl(0 84% 55%)', Icon: Zap, label: 'Autonomous' },
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

  const sourcePieData = useMemo(() => [
    { name: 'In-house', value: techStats.inHouse, color: 'hsl(199 89% 48%)' },
    { name: 'Partner', value: techStats.partner, color: 'hsl(280 65% 65%)' },
    { name: 'Mixed', value: techStats.mixed, color: 'hsl(27 87% 55%)' },
  ].filter(d => d.value > 0), [techStats]);

  const tierPieData = useMemo(() => [
    { name: 'Assistive', value: techStats.assistive, color: 'hsl(199 89% 48%)' },
    { name: 'Conditional', value: techStats.conditional, color: 'hsl(27 87% 55%)' },
    { name: 'Autonomous', value: techStats.autonomous, color: 'hsl(0 84% 55%)' },
  ].filter(d => d.value > 0), [techStats]);

  const companySystemCounts = useMemo(() => {
    return selectedCompanies.map(c => {
      let count = 0;
      selectedDomains.forEach(d => { count += techTags[c][d].length; });
      return { company: c.split(' ')[0], fullName: c, count, color: COMPANY_COLORS[c] };
    }).sort((a, b) => b.count - a.count);
  }, [selectedCompanies, selectedDomains]);

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="glass-card rounded-lg p-3" style={{ boxShadow: 'inset 0 0 0 1px hsl(199 89% 48% / 0.15)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Systems</span>
          </div>
          <p className="text-2xl font-bold text-primary">{techStats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 glow-border-red">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5" style={{ color: 'hsl(0 84% 55%)' }} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Autonomous</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'hsl(0 84% 55%)' }}>{techStats.autonomous}</p>
        </div>
        <div className="glass-card rounded-lg p-3 glow-border-green">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Live }} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Live</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{techStats.live}</p>
        </div>
        <div className="glass-card rounded-lg p-3 glow-border-orange">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Pilot }} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pilot</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'hsl(27 87% 55%)' }}>{techStats.pilot}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="flex gap-4">
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${selectedDomains.length}, 1fr)` }}>
                  <div className="p-2" />
                  {selectedDomains.map(domain => (
                    <div key={domain} className="p-1.5 text-center text-[10px] font-semibold text-muted-foreground/80">
                      {domain.replace(' AI', '').replace('Autonomous ', '')}
                    </div>
                  ))}
                  <AnimatePresence>
                    {selectedCompanies.map(company => {
                      const isHighlighted = highlightedCompany === company;
                      return [
                        <motion.div
                          key={`label-${company}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-1.5 flex items-center gap-1.5"
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                          <span className="text-[11px] font-medium text-muted-foreground truncate">{company}</span>
                        </motion.div>,
                        ...selectedDomains.map(domain => {
                          const tags = techTags[company][domain];
                          const isSelected = selectedCell?.company === company && selectedCell?.domain === domain;
                          return (
                            <motion.div
                              key={`${company}-${domain}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="p-1 rounded-lg cursor-pointer transition-all duration-200 glass-card"
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
                                      className="flex items-center gap-1 rounded px-1.5 py-0.5"
                                      style={{ backgroundColor: ac.bg, borderLeft: `2px solid ${ac.border}` }}
                                    >
                                      <TierIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ac.glow }} />
                                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[tag.status] }} />
                                      <span className="text-[10px] font-medium leading-tight truncate">{tag.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        }),
                      ];
                    })}
                  </AnimatePresence>
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
                  className="w-72 flex-shrink-0"
                >
                  <div className="glass-card rounded-xl glow-border-blue">
                    <div className="p-3 border-b border-border/30">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[selectedCell.company] }} />
                          {selectedCell.company}
                        </div>
                        <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setSelectedCell(null)} data-testid="button-close-detail">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{selectedCell.domain}</p>
                    </div>
                    <ScrollArea className="h-[320px]">
                      <div className="space-y-3 p-3">
                        {selectedCell.tags.map(tag => {
                          const ac = AUTONOMY_CONFIG[tag.autonomy];
                          const SrcCfg = SOURCE_CONFIG[tag.source];
                          return (
                            <div key={tag.label} className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs">{tag.label}</span>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-[9px] no-default-active-elevate border-border/50 px-1.5">{tag.status}</Badge>
                                  <Badge variant="outline" className="text-[9px] no-default-active-elevate border-border/50 px-1.5">
                                    <SrcCfg.icon className="w-2 h-2 mr-0.5" />
                                    {tag.source}
                                  </Badge>
                                  <Badge className="text-[9px] no-default-active-elevate px-1.5" style={{ backgroundColor: ac.bg, color: ac.glow, border: `1px solid ${ac.border}` }}>
                                    {tag.autonomy}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{tag.description}</p>
                              <div className="flex items-start gap-1.5 p-2 rounded-md" style={{ backgroundColor: 'hsl(0 84% 55% / 0.06)', border: '1px solid hsl(0 84% 55% / 0.12)' }}>
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0 84% 55%)' }} />
                                <p className="text-[10px]" style={{ color: 'hsl(0 84% 70%)' }}>{tag.riskNote}</p>
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
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source Mix</span>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {sourcePieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(222 22% 11%)', border: '1px solid hsl(217 20% 20%)', borderRadius: 8, fontSize: 11, color: 'hsl(210 40% 90%)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {sourcePieData.map(d => {
                const cfg = SOURCE_CONFIG[d.name];
                return (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                    <cfg.icon className="w-3 h-3" style={{ color: d.color }} />
                    <span className="text-muted-foreground flex-1">{d.name}</span>
                    <span className="font-bold font-mono" style={{ color: d.color }}>{d.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tier Breakdown</span>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {tierPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(222 22% 11%)', border: '1px solid hsl(217 20% 20%)', borderRadius: 8, fontSize: 11, color: 'hsl(210 40% 90%)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {tierPieData.map(d => {
                const ac = AUTONOMY_CONFIG[d.name];
                return (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                    <ac.Icon className="w-3 h-3" style={{ color: d.color }} />
                    <span className="text-muted-foreground flex-1">{d.name}</span>
                    <span className="font-bold font-mono" style={{ color: d.color }}>{d.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Systems / Company</span>
            <div className="mt-2 space-y-1.5">
              {companySystemCounts.map((c) => (
                <div key={c.fullName} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] text-muted-foreground flex-1 truncate">{c.company}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(c.count / Math.max(...companySystemCounts.map(x => x.count))) * 100}%`, backgroundColor: c.color }} />
                  </div>
                  <span className="text-[10px] font-bold font-mono w-4 text-right" style={{ color: c.color }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
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
  );
}
