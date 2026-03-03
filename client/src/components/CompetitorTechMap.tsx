import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, FileText, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyChips, DomainChips } from './ToggleChips';
import { useDashboard } from '@/lib/DashboardContext';
import {
  COMPANIES, DOMAINS, COMPANY_COLORS,
  techTags, type Company, type Domain, type TechTag,
} from '@/lib/data';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Live: { bg: 'hsl(142 76% 36%)', text: '#fff' },
  Pilot: { bg: 'hsl(27 87% 50%)', text: '#fff' },
};

const SOURCE_STYLES: Record<string, { bg: string; text: string }> = {
  'In-house': { bg: 'hsl(217 91% 48%)', text: '#fff' },
  Partner: { bg: 'hsl(280 65% 48%)', text: '#fff' },
  Mixed: { bg: 'hsl(340 75% 50%)', text: '#fff' },
};

const AUTONOMY_STYLES: Record<string, { bg: string; text: string }> = {
  Assistive: { bg: 'hsl(210 15% 80%)', text: 'hsl(0 0% 15%)' },
  Conditional: { bg: 'hsl(27 87% 50%)', text: '#fff' },
  Autonomous: { bg: 'hsl(0 84% 45%)', text: '#fff' },
};

interface CellDetail {
  company: Company;
  domain: Domain;
  tags: TechTag[];
}

function generatePresenterNotes(companies: Company[], domains: Domain[]): string[] {
  const notes: string[] = [];

  notes.push(`Comparing ${companies.join(', ')} across ${domains.join(', ')}.`);

  const inHouseCounts = companies.map(c => ({
    company: c,
    count: domains.reduce((sum, d) => sum + techTags[c][d].filter(t => t.source === 'In-house').length, 0),
  }));
  const mostInHouse = inHouseCounts.reduce((a, b) => a.count > b.count ? a : b);
  notes.push(`${mostInHouse.company} has the most in-house technology (${mostInHouse.count} systems), indicating deeper strategic control over AI governance.`);

  const autonomousCounts = companies.map(c => ({
    company: c,
    count: domains.reduce((sum, d) => sum + techTags[c][d].filter(t => t.autonomy === 'Autonomous').length, 0),
  }));
  const mostAutonomous = autonomousCounts.reduce((a, b) => a.count > b.count ? a : b);
  if (mostAutonomous.count > 0) {
    notes.push(`${mostAutonomous.company} deploys the most autonomous systems (${mostAutonomous.count}), requiring the most comprehensive governance controls.`);
  }

  const partnerReliant = companies.filter(c =>
    domains.every(d => techTags[c][d].some(t => t.source === 'Partner'))
  );
  if (partnerReliant.length > 0) {
    notes.push(`${partnerReliant.join(', ')} rely on partnerships across all selected domains, creating governance fragmentation and reduced control over core AI decisions.`);
  }

  if (domains.includes('Dispatch AI') && companies.includes('DoorDash')) {
    notes.push("DoorDash's ADP is the only platform orchestrating human Dashers, sidewalk robots, and drones through a single autonomous dispatch engine -- a unique governance challenge.");
  }

  if (companies.includes('Grubhub')) {
    notes.push("Grubhub's reliance on Nash AI for dispatch and support means governance responsibility is split across organizational boundaries, creating accountability gaps.");
  }

  return notes.slice(0, 7);
}

export function CompetitorTechMap() {
  const { state, dispatch } = useDashboard();
  const { selectedCompanies, selectedDomains, highlightedCompany } = state;
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const presenterNotes = useMemo(
    () => generatePresenterNotes(selectedCompanies, selectedDomains),
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Domains</p>
            <DomainChips
              domains={DOMAINS}
              selected={selectedDomains}
              onToggle={(d) => dispatch({ type: 'TOGGLE_DOMAIN', domain: d })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            data-testid="button-presenter-notes"
          >
            <FileText className="w-4 h-4 mr-1" />
            Presenter Notes
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_STYLES.Live.bg }} /> Live</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_STYLES.Pilot.bg }} /> Pilot</span>
        <span className="font-medium mx-1">|</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_STYLES['In-house'].bg }} /> In-house</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_STYLES.Partner.bg }} /> Partner</span>
        <span className="font-medium mx-1">|</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: AUTONOMY_STYLES.Assistive.bg }} /> Assistive</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: AUTONOMY_STYLES.Conditional.bg }} /> Conditional</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: AUTONOMY_STYLES.Autonomous.bg }} /> Autonomous</span>
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
                          className="p-2 rounded-md cursor-pointer transition-all duration-200 border"
                          style={{
                            backgroundColor: isSelected ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                            borderColor: isHighlighted ? COMPANY_COLORS[company] : isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                            borderWidth: isHighlighted || isSelected ? 2 : 1,
                          }}
                          onClick={() => setSelectedCell(isSelected ? null : { company, domain, tags })}
                          data-testid={`cell-${company.replace(/\s/g, '-')}-${domain.replace(/\s/g, '-')}`}
                        >
                          <div className="space-y-1">
                            {tags.map(tag => (
                              <div key={tag.label} className="space-y-0.5">
                                <div className="text-xs font-medium leading-tight">{tag.label}</div>
                                <div className="flex flex-wrap gap-0.5">
                                  <span
                                    className="text-[9px] px-1 rounded font-medium"
                                    style={{ backgroundColor: STATUS_STYLES[tag.status].bg, color: STATUS_STYLES[tag.status].text }}
                                  >
                                    {tag.status}
                                  </span>
                                  <span
                                    className="text-[9px] px-1 rounded font-medium"
                                    style={{ backgroundColor: SOURCE_STYLES[tag.source].bg, color: SOURCE_STYLES[tag.source].text }}
                                  >
                                    {tag.source}
                                  </span>
                                  <span
                                    className="text-[9px] px-1 rounded font-medium"
                                    style={{ backgroundColor: AUTONOMY_STYLES[tag.autonomy].bg, color: AUTONOMY_STYLES[tag.autonomy].text }}
                                  >
                                    {tag.autonomy}
                                  </span>
                                </div>
                              </div>
                            ))}
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
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4 pr-2">
                      {selectedCell.tags.map(tag => (
                        <div key={tag.label} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{tag.label}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-[10px] no-default-active-elevate">{tag.status}</Badge>
                              <Badge variant="outline" className="text-[10px] no-default-active-elevate">{tag.source}</Badge>
                              <Badge
                                className="text-[10px] no-default-active-elevate"
                                style={{ backgroundColor: AUTONOMY_STYLES[tag.autonomy].bg, color: AUTONOMY_STYLES[tag.autonomy].text }}
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
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Presenter Notes
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setShowNotes(false)} data-testid="button-close-notes">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="presenter-notes-list">
                  {presenterNotes.map((note, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="font-mono text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
                      {note}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
