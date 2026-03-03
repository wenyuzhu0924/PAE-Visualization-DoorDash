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
  COMPANIES, DOMAINS, COMPANY_COLORS, TIER_COLORS, STATUS_COLORS, SOURCE_COLORS,
  techTags, type Company, type Domain, type TechTag,
} from '@/lib/data';

const AUTONOMY_CONFIG: Record<string, { bg: string; border: string; glow: string; Icon: typeof Shield }> = {
  Assistive: { bg: TIER_COLORS.Assistive + '10', border: TIER_COLORS.Assistive + '40', glow: TIER_COLORS.Assistive, Icon: Shield },
  Conditional: { bg: TIER_COLORS.Conditional + '12', border: TIER_COLORS.Conditional + '45', glow: TIER_COLORS.Conditional, Icon: AlertTriangle },
  Autonomous: { bg: TIER_COLORS.Autonomous + '12', border: TIER_COLORS.Autonomous + '45', glow: TIER_COLORS.Autonomous, Icon: Zap },
};

const STATUS_DOT: Record<string, string> = STATUS_COLORS;

const SOURCE_CONFIG: Record<string, { icon: typeof Building2; color: string }> = {
  'In-house': { icon: Building2, color: SOURCE_COLORS['In-house'] },
  Partner: { icon: Handshake, color: SOURCE_COLORS.Partner },
  Mixed: { icon: Shuffle, color: SOURCE_COLORS.Mixed },
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
    { label: 'In-house', count: techStats.inHouse, color: SOURCE_COLORS['In-house'], Icon: Building2, desc: 'Built internally' },
    { label: 'Partner', count: techStats.partner, color: SOURCE_COLORS.Partner, Icon: Handshake, desc: 'External vendor' },
    { label: 'Mixed', count: techStats.mixed, color: SOURCE_COLORS.Mixed, Icon: Shuffle, desc: 'Joint development' },
  ], [techStats]);

  const tierBreakdown = useMemo(() => [
    { label: 'Assistive', count: techStats.assistive, color: TIER_COLORS.Assistive, Icon: Shield, desc: 'Human decides' },
    { label: 'Conditional', count: techStats.conditional, color: TIER_COLORS.Conditional, Icon: AlertTriangle, desc: 'AI decides w/ limits' },
    { label: 'Autonomous', count: techStats.autonomous, color: TIER_COLORS.Autonomous, Icon: Zap, desc: 'AI decides alone' },
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
          { icon: Zap, label: 'Total', value: techStats.total, color: '#22D3EE', glow: 'glow-border-cyan' },
          { icon: Zap, label: 'Autonomous', value: techStats.autonomous, color: TIER_COLORS.Autonomous, glow: 'glow-border-pink' },
          { icon: Shield, label: 'Live', value: techStats.live, color: STATUS_COLORS.Live, glow: 'glow-border-teal' },
          { icon: AlertTriangle, label: 'Pilot', value: techStats.pilot, color: STATUS_COLORS.Pilot, glow: 'glow-border-gold' },
        ].map(s => (
          <div key={s.label} className={`glass-card rounded-lg p-2 ${s.glow}`}>
            <div className="flex items-center gap-1.5">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color, filter: `drop-shadow(0 0 4px ${s.color}60)` }} />
              <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{s.label}</span>
              <span className="text-lg font-bold ml-auto" style={{ color: s.color }}>{s.value}</span>
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
                    <div key={domain} className="flex items-end justify-center pb-1 text-[10px] font-semibold text-muted-foreground/50 text-center tracking-wider">
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
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company], boxShadow: `0 0 6px ${COMPANY_COLORS[company]}50` }} />
                        <span className="text-[10px] font-medium text-muted-foreground/60 leading-tight">{company}</span>
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
                            className="rounded-md cursor-pointer transition-all duration-200 glass-card flex flex-col justify-center p-1 group"
                            style={{
                              borderColor: isHighlighted ? COMPANY_COLORS[company] + '50' : isSelected ? '#22D3EE66' : undefined,
                              borderWidth: isHighlighted || isSelected ? 1 : undefined,
                              boxShadow: isSelected ? '0 0 20px #22D3EE20' : isHighlighted ? `0 0 12px ${COMPANY_COLORS[company]}15` : undefined,
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
                                    <TierIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ac.glow, filter: `drop-shadow(0 0 3px ${ac.glow}50)` }} />
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[tag.status], boxShadow: `0 0 4px ${STATUS_DOT[tag.status]}60` }} />
                                    <span className="text-[10px] font-semibold leading-tight">{tag.label}</span>
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
                  <div className="glass-card-elevated rounded-xl glow-border-blue h-full">
                    <div className="p-2.5 border-b border-border/20">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[selectedCell.company], boxShadow: `0 0 6px ${COMPANY_COLORS[selectedCell.company]}50` }} />
                          {selectedCell.company}
                        </div>
                        <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground/50" onClick={() => setSelectedCell(null)} data-testid="button-close-detail">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5">{selectedCell.domain}</p>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3 p-2.5">
                        {selectedCell.tags.map(tag => {
                          const ac = AUTONOMY_CONFIG[tag.autonomy];
                          const SrcCfg = SOURCE_CONFIG[tag.source];
                          return (
                            <div key={tag.label} className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <ac.Icon className="w-3.5 h-3.5" style={{ color: ac.glow, filter: `drop-shadow(0 0 3px ${ac.glow}50)` }} />
                                <span className="font-semibold text-xs">{tag.label}</span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[9px] no-default-active-elevate border-border/30 px-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: STATUS_DOT[tag.status], boxShadow: `0 0 3px ${STATUS_DOT[tag.status]}60` }} />
                                  {tag.status}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] no-default-active-elevate border-border/30 px-1.5">
                                  <SrcCfg.icon className="w-2.5 h-2.5 mr-1" style={{ color: SrcCfg.color }} />
                                  {tag.source}
                                </Badge>
                                <Badge className="text-[9px] no-default-active-elevate px-1.5" style={{ backgroundColor: ac.bg, color: ac.glow, border: `1px solid ${ac.border}` }}>
                                  {tag.autonomy}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{tag.description}</p>
                              <div className="flex items-start gap-1.5 p-2 rounded-md" style={{ backgroundColor: '#EC489908', border: '1px solid #EC489918' }}>
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#EC4899', filter: 'drop-shadow(0 0 3px #EC489960)' }} />
                                <p className="text-[10px]" style={{ color: '#EC4899BB' }}>{tag.riskNote}</p>
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

          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40 flex-shrink-0 mt-1">
            {Object.entries(AUTONOMY_CONFIG).map(([tier, cfg]) => (
              <span key={tier} className="flex items-center gap-1">
                <cfg.Icon className="w-3 h-3" style={{ color: cfg.glow }} />
                {tier}
              </span>
            ))}
            <span className="opacity-20">|</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT.Live, boxShadow: `0 0 3px ${STATUS_DOT.Live}60` }} />Live</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT.Pilot, boxShadow: `0 0 3px ${STATUS_DOT.Pilot}60` }} />Pilot</span>
          </div>
        </div>

        <div className="w-56 flex-shrink-0 flex flex-col gap-2 min-h-0">
          <div className="glass-card rounded-xl p-2.5 flex-1 min-h-0 flex flex-col" data-testid="panel-systems-company">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Systems / Company</span>
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
                        <Cell key={c.fullName} fill={c.color} style={{ filter: `drop-shadow(0 0 6px ${c.color}60)` }} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'hsl(220 22% 9%)', border: '1px solid hsl(220 20% 16%)', borderRadius: 8, fontSize: 10, color: 'hsl(210 40% 90%)', boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)' }}
                      formatter={(value: number, name: string) => [`${value} systems`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary leading-none" style={{ filter: 'drop-shadow(0 0 6px hsl(192 85% 50% / 0.4))' }}>{techStats.total}</p>
                    <p className="text-[8px] text-muted-foreground/40 uppercase tracking-wider">total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1 flex-shrink-0">
              {companySystemCounts.map((c) => (
                <div key={c.fullName} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color, boxShadow: `0 0 5px ${c.color}50` }} />
                  <span className="text-[10px] text-muted-foreground/50 flex-1 truncate">{c.company}</span>
                  <span className="text-[10px] font-bold font-mono" style={{ color: c.color }}>{c.count}</span>
                  <span className="text-[9px] text-muted-foreground/25 w-6 text-right">{techStats.total > 0 ? Math.round((c.count / techStats.total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex-shrink-0" data-testid="panel-build-source">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Build Source</span>
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
                        <Cell key={s.label} fill={s.color} style={{ filter: `drop-shadow(0 0 4px ${s.color}50)` }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {sourceBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <s.Icon className="w-3 h-3 flex-shrink-0" style={{ color: s.color }} />
                    <span className="text-[9px] text-muted-foreground/50 flex-1">{s.label}</span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex-shrink-0" data-testid="panel-autonomy-level">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Autonomy Level</span>
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
                        <Cell key={t.label} fill={t.color} style={{ filter: `drop-shadow(0 0 4px ${t.color}50)` }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {tierBreakdown.map((t) => (
                  <div key={t.label} className="flex items-center gap-1">
                    <t.Icon className="w-3 h-3 flex-shrink-0" style={{ color: t.color }} />
                    <span className="text-[9px] text-muted-foreground/50 flex-1">{t.label}</span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: t.color }}>{t.count}</span>
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
