import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Info, Shield, AlertTriangle, Zap } from 'lucide-react';
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

interface CellDetail {
  company: Company;
  domain: Domain;
  tags: TechTag[];
}

export function CompetitorTechMap() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, selectedDomains, highlightedCompany } = state;
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const techCounts = useMemo(() => {
    const counts = { total: 0, autonomous: 0, inHouse: 0, pilot: 0 };
    selectedCompanies.forEach(c => {
      selectedDomains.forEach(d => {
        techTags[c][d].forEach(t => {
          counts.total++;
          if (t.autonomy === 'Autonomous') counts.autonomous++;
          if (t.source === 'In-house') counts.inHouse++;
          if (t.status === 'Pilot') counts.pilot++;
        });
      });
    });
    return counts;
  }, [selectedCompanies, selectedDomains]);

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

      <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          {Object.entries(AUTONOMY_CONFIG).map(([tier, cfg]) => {
            const Icon = cfg.Icon;
            return (
              <span key={tier} className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color: cfg.glow }} />
                {tier}
              </span>
            );
          })}
          <span className="opacity-30">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Live }} />
            Live
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Pilot }} />
            Pilot
          </span>
        </div>
        <span className="text-muted-foreground/60 font-mono text-[10px]">
          {techCounts.total} systems / {techCounts.autonomous} autonomous / {techCounts.pilot} pilot
        </span>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${selectedDomains.length}, 1fr)` }}>
              <div className="p-2" />
              {selectedDomains.map(domain => (
                <div key={domain} className="p-2 text-center text-[11px] font-semibold text-muted-foreground/80">
                  {domain}
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
                      className="p-2 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                      <span className="text-xs font-medium text-muted-foreground">{company}</span>
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
                          className="p-1.5 rounded-lg cursor-pointer transition-all duration-200 glass-card"
                          style={{
                            borderColor: isHighlighted ? COMPANY_COLORS[company] + '50' : isSelected ? 'hsl(199 89% 48% / 0.4)' : undefined,
                            borderWidth: isHighlighted || isSelected ? 1 : undefined,
                            boxShadow: isSelected ? '0 0 15px hsl(199 89% 48% / 0.15)' : isHighlighted ? `0 0 10px ${COMPANY_COLORS[company]}20` : undefined,
                          }}
                          onClick={() => setSelectedCell(isSelected ? null : { company, domain, tags })}
                          data-testid={`cell-${company.replace(/\s/g, '-')}-${domain.replace(/\s/g, '-')}`}
                        >
                          <div className="space-y-1">
                            {tags.map(tag => {
                              const ac = AUTONOMY_CONFIG[tag.autonomy];
                              const TierIcon = ac.Icon;
                              return (
                                <div
                                  key={tag.label}
                                  className="flex items-center gap-1.5 rounded-md px-2 py-1"
                                  style={{ backgroundColor: ac.bg, borderLeft: `2px solid ${ac.border}` }}
                                >
                                  <TierIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ac.glow }} />
                                  <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: STATUS_DOT[tag.status] }}
                                  />
                                  <span className="text-[11px] font-medium leading-tight truncate">
                                    {tag.label}
                                  </span>
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
              className="w-80 flex-shrink-0"
            >
              <div className="glass-card rounded-xl glow-border-blue">
                <div className="p-3 border-b border-border/30">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[selectedCell.company] }} />
                      {selectedCell.company} / {selectedCell.domain.replace(' AI', '')}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6"
                      onClick={() => setSelectedCell(null)}
                      data-testid="button-close-detail"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[360px]">
                  <div className="space-y-3 p-3">
                    {selectedCell.tags.map(tag => {
                      const ac = AUTONOMY_CONFIG[tag.autonomy];
                      return (
                        <div key={tag.label} className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{tag.label}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-[10px] no-default-active-elevate border-border/50">{tag.status}</Badge>
                              <Badge variant="outline" className="text-[10px] no-default-active-elevate border-border/50">{tag.source}</Badge>
                              <Badge
                                className="text-[10px] no-default-active-elevate"
                                style={{ backgroundColor: ac.bg, color: ac.glow, border: `1px solid ${ac.border}` }}
                              >
                                {tag.autonomy}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{tag.description}</p>
                          <div className="flex items-start gap-1.5 p-2 rounded-md" style={{ backgroundColor: 'hsl(0 84% 55% / 0.08)', border: '1px solid hsl(0 84% 55% / 0.15)' }}>
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0 84% 55%)' }} />
                            <p className="text-xs" style={{ color: 'hsl(0 84% 70%)' }}>{tag.riskNote}</p>
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
  );
}
