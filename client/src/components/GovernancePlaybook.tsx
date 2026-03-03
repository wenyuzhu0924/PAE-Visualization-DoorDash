import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, ChevronRight, Zap, FileText, AlertTriangle,
  ShieldCheck, X, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/lib/DashboardContext';
import { lifecycleStages, gates, controlSwimlanes, type LifecycleStage, type Gate } from '@/lib/data';

function getControlKey(autonomy: string, exposure: string): string {
  return `${autonomy}-${exposure}`;
}

function generatePresenterScript(autonomy: string, exposure: string): string[] {
  const level = autonomy === 'Autonomous' && exposure === 'High' ? 'maximum'
    : autonomy === 'Autonomous' || exposure === 'High' ? 'elevated' : 'standard';

  const lines = [
    `This governance lifecycle is configured for ${autonomy} autonomy with ${exposure} stakeholder exposure -- a ${level} governance intensity.`,
    `Stage 1 begins with problem selection as governance filtering. Teams must justify why an agentic solution is appropriate instead of deterministic automation.`,
    `The agent specification in Stage 2 formalizes the core alignment question: what is the system optimizing for? This is where optimization misalignment is prevented.`,
    `Workflow design in Stage 3 assigns the autonomy tier and defines human-in-the-loop requirements. ${autonomy === 'Autonomous' ? 'For autonomous systems, mandatory kill-switches and multi-stakeholder escalation paths are required.' : 'Escalation triggers are tied to measurable conditions.'}`,
    `Red-teaming in Stage 4 stress-tests against adversarial personas. ${exposure === 'High' ? 'High-exposure systems require all attack taxonomy categories including cascade failure simulation.' : 'Standard testing covers functional and security scenarios.'}`,
    `${autonomy === 'Autonomous' && exposure === 'High' ? 'Pilot deployment requires executive kill-switch authorization and real-time fairness monitoring with incident response under 15 minutes.' : 'Pilot deployment proceeds with defined guardrails and monitoring.'}`,
    `Scaling is treated as a governance decision -- not a feature update. ${autonomy === 'Autonomous' ? 'Autonomy expansion requires board-level approval, zero significant fairness deviations, and verified system rollback capability.' : 'Standard scaling review ensures continued compliance.'}`,
  ];
  return lines;
}

function runReadinessCheck(stage: LifecycleStage, controlKey: string, completedControls: Set<string>): { passed: boolean; missing: string[] } {
  const controls = stage.mandatoryControls[controlKey] || [];
  const missing = controls.filter(c => !completedControls.has(`${stage.id}-${c}`));
  return { passed: missing.length === 0, missing };
}

export function GovernancePlaybook() {
  const { state, dispatch } = useDashboard();
  const { autonomyTier, exposureLevel } = state;
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(null);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [readinessResults, setReadinessResults] = useState<Record<number, { passed: boolean; missing: string[] }>>({});
  const [completedControls, setCompletedControls] = useState<Set<string>>(new Set());

  const controlKey = getControlKey(autonomyTier, exposureLevel);
  const script = useMemo(() => generatePresenterScript(autonomyTier, exposureLevel), [autonomyTier, exposureLevel]);

  const intensityLevel = autonomyTier === 'Autonomous' && exposureLevel === 'High' ? 'Maximum'
    : autonomyTier === 'Autonomous' || exposureLevel === 'High' ? 'Elevated' : 'Standard';

  const intensityColor = intensityLevel === 'Maximum' ? 'hsl(0 84% 45%)'
    : intensityLevel === 'Elevated' ? 'hsl(27 87% 50%)' : 'hsl(142 76% 36%)';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Autonomy Tier</p>
            <Select
              value={autonomyTier}
              onValueChange={(v) => dispatch({ type: 'SET_AUTONOMY_TIER', tier: v as any })}
            >
              <SelectTrigger className="w-[160px]" data-testid="select-autonomy-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assistive">Assistive</SelectItem>
                <SelectItem value="Conditional">Conditional</SelectItem>
                <SelectItem value="Autonomous">Autonomous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Exposure Level</p>
            <Select
              value={exposureLevel}
              onValueChange={(v) => dispatch({ type: 'SET_EXPOSURE', level: v as any })}
            >
              <SelectTrigger className="w-[120px]" data-testid="select-exposure-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Badge className="no-default-active-elevate" style={{ backgroundColor: intensityColor, color: '#fff' }}>
              {intensityLevel} Governance Intensity
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const results: Record<number, { passed: boolean; missing: string[] }> = {};
              lifecycleStages.forEach(s => { results[s.id] = runReadinessCheck(s, controlKey, completedControls); });
              setReadinessResults(results);
            }}
            data-testid="button-readiness-check"
          >
            <Zap className="w-4 h-4 mr-1" />
            Run Readiness Check
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowScript(!showScript)} data-testid="button-generate-script">
            <FileText className="w-4 h-4 mr-1" />
            Presenter Script
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2" data-testid="lifecycle-pipeline">
          {lifecycleStages.map((stage, i) => {
            const controls = stage.mandatoryControls[controlKey] || stage.mandatoryControls['Assistive-Low'] || [];
            const readiness = readinessResults[stage.id];
            const isSelected = selectedStage?.id === stage.id;
            const gateAfter = i < gates.length ? gates[i] : null;

            return (
              <div key={stage.id} className="flex items-stretch flex-shrink-0">
                <motion.div
                  className="cursor-pointer rounded-md border p-3 transition-all duration-200"
                  style={{
                    width: 160,
                    borderColor: isSelected ? 'hsl(var(--primary))' : readiness ? (readiness.passed ? 'hsl(142 76% 36%)' : 'hsl(0 84% 45%)') : 'hsl(var(--border))',
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                  }}
                  onClick={() => { setSelectedStage(isSelected ? null : stage); setSelectedGate(null); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  data-testid={`stage-card-${stage.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">Stage {stage.id}</span>
                    {readiness && (
                      readiness.passed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : <XCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight mb-1">{stage.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{controls.length} controls active</p>
                </motion.div>

                {gateAfter && (
                  <motion.div
                    className="flex flex-col items-center justify-center px-1 cursor-pointer"
                    onClick={() => { setSelectedGate(selectedGate?.id === gateAfter.id ? null : gateAfter); setSelectedStage(null); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.04 }}
                    data-testid={`gate-${gateAfter.id}`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-colors"
                      style={{
                        borderColor: selectedGate?.id === gateAfter.id ? 'hsl(var(--primary))' : intensityColor,
                        color: intensityColor,
                        backgroundColor: selectedGate?.id === gateAfter.id ? 'hsl(var(--accent))' : 'transparent',
                      }}
                    >
                      {gateAfter.id}
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2" data-testid="control-swimlanes">
          {controlSwimlanes.map(lane => (
            <Card key={lane.id}>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">{lane.label}</CardTitle>
                <p className="text-[10px] text-muted-foreground">{lane.subtitle}</p>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <div className="space-y-1">
                  {lane.stages.map((content, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground leading-tight p-1 rounded" style={{ minHeight: 20, backgroundColor: content ? 'hsl(var(--accent))' : 'transparent' }}>
                      {content || <span className="italic opacity-40">--</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedStage && (
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
                    <span className="font-mono text-xs text-muted-foreground">Stage {selectedStage.id}</span>
                    {selectedStage.title}
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedStage(null)} data-testid="button-close-stage">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                    <TabsTrigger value="controls" data-testid="tab-controls">Controls</TabsTrigger>
                    <TabsTrigger value="failures" data-testid="tab-failures">Failure Modes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Purpose</p>
                      <p className="text-sm leading-relaxed">{selectedStage.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Required Deliverables</p>
                      <ul className="space-y-1">
                        {selectedStage.deliverables.map((d, i) => {
                          const readiness = readinessResults[selectedStage.id];
                          const isMissing = readiness && !readiness.passed && readiness.missing.some(m => d.toLowerCase().includes(m.toLowerCase().split(' ')[0]));
                          return (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              {isMissing
                                ? <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                                : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              }
                              <span className={isMissing ? 'text-destructive' : ''}>{d}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="controls" className="mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" style={{ color: intensityColor }} />
                          <p className="text-sm font-medium">Mandatory Controls for {autonomyTier} / {exposureLevel} Exposure</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const controls = selectedStage.mandatoryControls[controlKey] || [];
                            const next = new Set(completedControls);
                            controls.forEach(c => next.add(`${selectedStage.id}-${c}`));
                            setCompletedControls(next);
                          }}
                          data-testid="button-auto-populate"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Auto-populate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Click a control to mark it as complete</p>
                      {(selectedStage.mandatoryControls[controlKey] || []).map((control, i) => {
                        const controlId = `${selectedStage.id}-${control}`;
                        const isDone = completedControls.has(controlId);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2 text-sm p-2 rounded-md bg-accent/50 cursor-pointer"
                            onClick={() => {
                              const next = new Set(completedControls);
                              if (isDone) next.delete(controlId); else next.add(controlId);
                              setCompletedControls(next);
                            }}
                            data-testid={`control-check-${selectedStage.id}-${i}`}
                          >
                            {isDone
                              ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-500" />
                              : <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: intensityColor }} />
                            }
                            <span className={isDone ? 'line-through opacity-60' : ''}>{control}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="failures" className="mt-4">
                    <div className="space-y-2">
                      {selectedStage.failureModes.map((mode, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-md bg-destructive/5">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-destructive flex-shrink-0" />
                          {mode}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGate && (
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
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                      style={{ borderColor: intensityColor, color: intensityColor }}
                    >
                      {selectedGate.id}
                    </span>
                    {selectedGate.meaning}
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedGate(null)} data-testid="button-close-gate">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Go/No-Go Criteria</p>
                    <ul className="space-y-1.5">
                      {(selectedGate.criteria[controlKey] || selectedGate.criteria['Assistive-Low'] || []).map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Required Sign-offs</p>
                    <ul className="space-y-1.5">
                      {(selectedGate.signOffs[controlKey] || selectedGate.signOffs['Assistive-Low'] || []).map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-[10px] no-default-active-elevate">{s}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Required Evidence</p>
                    <ul className="space-y-1.5">
                      {selectedGate.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <FileText className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScript && (
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
                    <Sparkles className="w-4 h-4 text-chart-2" />
                    Presenter Script
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setShowScript(false)} data-testid="button-close-script">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">For {autonomyTier} autonomy, {exposureLevel} exposure</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" data-testid="presenter-script-list">
                  {script.map((line, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="font-mono text-xs text-muted-foreground mt-0.5 flex-shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{line}</span>
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
