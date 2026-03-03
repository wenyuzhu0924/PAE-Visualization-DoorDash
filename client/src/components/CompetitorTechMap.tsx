import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  techTags, type Company, type Domain, type TechTag,
} from '@/lib/data';

const AUTONOMY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Assistive: { bg: 'hsl(210 15% 95%)', border: 'hsl(210 15% 70%)', text: 'hsl(210 15% 35%)' },
  Conditional: { bg: 'hsl(27 87% 95%)', border: 'hsl(27 87% 50%)', text: 'hsl(27 87% 35%)' },
  Autonomous: { bg: 'hsl(0 84% 96%)', border: 'hsl(0 84% 45%)', text: 'hsl(0 84% 35%)' },
};

const STATUS_DOT: Record<string, string> = {
  Live: 'hsl(142 76% 36%)',
  Pilot: 'hsl(27 87% 50%)',
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
          <p className="text-sm font-medium text-muted-foreground mb-2">Domains</p>
          <DomainChips
            domains={DOMAINS}
            selected={selectedDomains}
            onToggle={(d) => dispatch({ type: 'TOGGLE_DOMAIN', domain: d })}
          />
        </div>
      </div>

      <div className="flex gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-medium text-foreground">Autonomy:</span>
          {Object.entries(AUTONOMY_COLORS).map(([tier, colors]) => (
            <span key={tier} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: colors.bg, borderColor: colors.border }} />
              {tier}
            </span>
          ))}
        </div>
        <span className="text-muted-foreground">|</span>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="font-medium text-foreground">Status:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Live }} />
            Live
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT.Pilot }} />
            Pilot
          </span>
        </div>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">
          {techCounts.total} systems, {techCounts.autonomous} autonomous, {techCounts.pilot} pilot
        </span>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `140px repeat(${selectedDomains.length}, 1fr)` }}>
              <div className="p-2" />
              {selectedDomains.map(domain => (
                <div key={domain} className="p-2 text-center text-xs font-semibold text-muted-foreground">
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
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COMPANY_COLORS[company] }} />
                      <span className="text-sm font-medium">{company}</span>
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
                          className="p-2 rounded-md cursor-pointer transition-all duration-200"
                          style={{
                            backgroundColor: isSelected ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                            border: `${isHighlighted || isSelected ? 2 : 1}px solid ${isHighlighted ? COMPANY_COLORS[company] : isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                          }}
                          onClick={() => setSelectedCell(isSelected ? null : { company, domain, tags })}
                          data-testid={`cell-${company.replace(/\s/g, '-')}-${domain.replace(/\s/g, '-')}`}
                        >
                          <div className="space-y-1.5">
                            {tags.map(tag => {
                              const ac = AUTONOMY_COLORS[tag.autonomy];
                              return (
                                <div
                                  key={tag.label}
                                  className="flex items-center gap-1.5 rounded px-1.5 py-0.5"
                                  style={{ backgroundColor: ac.bg, borderLeft: `3px solid ${ac.border}` }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: STATUS_DOT[tag.status] }}
                                  />
                                  <span className="text-xs font-medium leading-tight truncate" style={{ color: ac.text }}>
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
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COMPANY_COLORS[selectedCell.company] }} />
                      {selectedCell.company} - {selectedCell.domain}
                    </CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedCell(null)}
                      data-testid="button-close-detail"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[340px]">
                    <div className="space-y-4 pr-2">
                      {selectedCell.tags.map(tag => {
                        const ac = AUTONOMY_COLORS[tag.autonomy];
                        return (
                          <div key={tag.label} className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{tag.label}</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-[10px] no-default-active-elevate">{tag.status}</Badge>
                                <Badge variant="outline" className="text-[10px] no-default-active-elevate">{tag.source}</Badge>
                                <Badge
                                  className="text-[10px] no-default-active-elevate"
                                  style={{ backgroundColor: ac.bg, color: ac.text, border: `1px solid ${ac.border}` }}
                                >
                                  {tag.autonomy}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{tag.description}</p>
                            <div className="flex items-start gap-1.5 p-2 rounded-md bg-destructive/10">
                              <Info className="w-3 h-3 mt-0.5 text-destructive flex-shrink-0" />
                              <p className="text-xs text-destructive">{tag.riskNote}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
