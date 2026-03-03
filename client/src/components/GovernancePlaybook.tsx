import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, ChevronRight, AlertTriangle,
  ShieldCheck, X, Sparkles, FileCheck, ClipboardCheck,
  Calendar, Target, Crosshair, Skull,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/lib/DashboardContext';
import {
  lifecycleStages, gates, controlSwimlanes, implementationPhases, redTeamCategories,
  type LifecycleStage, type Gate,
} from '@/lib/data';

function getControlKey(autonomy: string, exposure: string): string {
  return `${autonomy}-${exposure}`;
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
  const [readinessResults, setReadinessResults] = useState<Record<number, { passed: boolean; missing: string[] }>>({});
  const [completedControls, setCompletedControls] = useState<Set<string>>(new Set());

  const controlKey = getControlKey(autonomyTier, exposureLevel);

  const intensityLevel = autonomyTier === 'Autonomous' && exposureLevel === 'High' ? 'Maximum'
    : autonomyTier === 'Autonomous' || exposureLevel === 'High' ? 'Elevated' : 'Standard';

  const intensityColor = intensityLevel === 'Maximum' ? 'hsl(0 84% 55%)'
    : intensityLevel === 'Elevated' ? 'hsl(27 87% 55%)' : 'hsl(142 76% 45%)';

  const intensityGlow = intensityLevel === 'Maximum' ? 'glow-border-red'
    : intensityLevel === 'Elevated' ? 'glow-border-orange' : 'glow-border-green';

  const totalControls = useMemo(() => {
    return lifecycleStages.reduce((sum, s) => sum + (s.mandatoryControls[controlKey] || []).length, 0);
  }, [controlKey]);

  const completedCount = useMemo(() => {
    return lifecycleStages.reduce((sum, s) => {
      return sum + (s.mandatoryControls[controlKey] || []).filter(c => completedControls.has(`${s.id}-${c}`)).length;
    }, 0);
  }, [controlKey, completedControls]);

  const overallProgress = totalControls > 0 ? (completedCount / totalControls) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={autonomyTier} onValueChange={(v) => dispatch({ type: 'SET_AUTONOMY_TIER', tier: v as any })}>
            <SelectTrigger className="w-[130px] h-8 text-xs border-border/50" data-testid="select-autonomy-tier"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistive">Assistive</SelectItem>
              <SelectItem value="Conditional">Conditional</SelectItem>
              <SelectItem value="Autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exposureLevel} onValueChange={(v) => dispatch({ type: 'SET_EXPOSURE', level: v as any })}>
            <SelectTrigger className="w-[90px] h-8 text-xs border-border/50" data-testid="select-exposure-level"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="no-default-active-elevate text-[10px]" style={{ backgroundColor: intensityColor + '20', color: intensityColor, border: `1px solid ${intensityColor}30` }}>{intensityLevel}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: intensityColor, boxShadow: `0 0 6px ${intensityColor}60` }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{completedCount}/{totalControls}</span>
          </div>
          <Button
            variant="outline" size="sm"
            className="border-border/50 text-xs h-7"
            onClick={() => {
              const results: Record<number, { passed: boolean; missing: string[] }> = {};
              lifecycleStages.forEach(s => { results[s.id] = runReadinessCheck(s, controlKey, completedControls); });
              setReadinessResults(results);
            }}
            data-testid="button-readiness-check"
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Check
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 glow-border-blue">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lifecycle Pipeline</span>
          <span className="text-[10px] text-muted-foreground">6 stages / 5 gates</span>
        </div>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-1" data-testid="lifecycle-pipeline">
          {lifecycleStages.map((stage, i) => {
            const controls = stage.mandatoryControls[controlKey] || stage.mandatoryControls['Assistive-Low'] || [];
            const stageCompleted = controls.filter(c => completedControls.has(`${stage.id}-${c}`)).length;
            const readiness = readinessResults[stage.id];
            const isSelected = selectedStage?.id === stage.id;
            const gateAfter = i < gates.length ? gates[i] : null;
            const progress = controls.length > 0 ? (stageCompleted / controls.length) * 100 : 0;

            return (
              <div key={stage.id} className="flex items-stretch flex-shrink-0">
                <motion.div
                  className={`cursor-pointer rounded-lg glass-card overflow-hidden transition-all duration-200 ${isSelected ? 'glow-border-blue' : readiness ? (readiness.passed ? 'glow-border-green' : 'glow-border-red') : ''}`}
                  style={{ width: 120 }}
                  onClick={() => { setSelectedStage(isSelected ? null : stage); setSelectedGate(null); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  data-testid={`stage-card-${stage.id}`}
                >
                  <div className="h-0.5" style={{ background: `${intensityColor}80` }} />
                  <div className="p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-primary/60">S{stage.id}</span>
                      {readiness && (readiness.passed ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />)}
                    </div>
                    <p className="text-[11px] font-semibold leading-tight mb-1.5">{stage.shortTitle}</p>
                    <div className="space-y-0.5">
                      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: intensityColor, boxShadow: `0 0 4px ${intensityColor}60` }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, delay: i * 0.06 }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground">{stageCompleted}/{controls.length}</span>
                    </div>
                  </div>
                </motion.div>

                {gateAfter && (
                  <motion.div
                    className="flex flex-col items-center justify-center px-0.5 cursor-pointer"
                    onClick={() => { setSelectedGate(selectedGate?.id === gateAfter.id ? null : gateAfter); setSelectedStage(null); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 + 0.03 }}
                    data-testid={`gate-${gateAfter.id}`}
                  >
                    <div className="w-px h-2" style={{ backgroundColor: intensityColor + '40' }} />
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ border: `2px solid ${selectedGate?.id === gateAfter.id ? 'hsl(199 89% 48%)' : intensityColor + '60'}`, color: intensityColor, backgroundColor: selectedGate?.id === gateAfter.id ? 'hsl(199 89% 48% / 0.1)' : 'hsl(222 22% 9%)', boxShadow: selectedGate?.id === gateAfter.id ? '0 0 8px hsl(199 89% 48% / 0.3)' : `0 0 4px ${intensityColor}20` }}>
                      {gateAfter.id}
                    </div>
                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {selectedStage && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <div className={`glass-card rounded-xl ${intensityGlow}`}>
                  <div className="p-3 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="font-mono text-xs text-primary/60">S{selectedStage.id}</span>
                        {selectedStage.title}
                      </div>
                      <Button size="icon" variant="ghost" className="w-5 h-5" onClick={() => setSelectedStage(null)} data-testid="button-close-stage"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" style={{ color: intensityColor }} />Controls</p>
                        <Button variant="ghost" size="sm" className="h-4 text-[9px] px-1.5 text-primary" onClick={() => { const controls = selectedStage.mandatoryControls[controlKey] || []; const next = new Set(completedControls); controls.forEach(c => next.add(`${selectedStage.id}-${c}`)); setCompletedControls(next); }} data-testid="button-auto-populate">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />Mark all
                        </Button>
                      </div>
                      <div className="space-y-0.5">
                        {(selectedStage.mandatoryControls[controlKey] || []).map((control, i) => {
                          const controlId = `${selectedStage.id}-${control}`;
                          const isDone = completedControls.has(controlId);
                          return (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] p-1 rounded cursor-pointer transition-colors hover:bg-white/5" onClick={() => { const next = new Set(completedControls); if (isDone) next.delete(controlId); else next.add(controlId); setCompletedControls(next); }} data-testid={`control-check-${selectedStage.id}-${i}`}>
                              {isDone ? <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-400" /> : <div className="w-3 h-3 rounded-full border flex-shrink-0" style={{ borderColor: intensityColor + '60' }} />}
                              <span className={isDone ? 'line-through opacity-40' : 'text-muted-foreground'}>{control}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><FileCheck className="w-3 h-3 text-primary/60" />Deliverables</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedStage.deliverables.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] no-default-active-elevate border-border/40 px-1.5">
                              <ClipboardCheck className="w-2 h-2 mr-0.5 text-green-400/60" />{d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" style={{ color: 'hsl(0 84% 60%)' }} />Failure Modes</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedStage.failureModes.map((mode, i) => (
                            <Badge key={i} variant="outline" className="text-[9px] no-default-active-elevate px-1.5" style={{ borderColor: 'hsl(0 84% 55% / 0.2)', color: 'hsl(0 84% 65%)' }}>
                              <AlertTriangle className="w-2 h-2 mr-0.5" />{mode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedGate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <div className="glass-card rounded-xl glow-border-blue">
                  <div className="p-3 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ border: `2px solid ${intensityColor}`, color: intensityColor }}>{selectedGate.id}</span>
                        {selectedGate.meaning}
                      </div>
                      <Button size="icon" variant="ghost" className="w-5 h-5" onClick={() => setSelectedGate(null)} data-testid="button-close-gate"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Go/No-Go</p>
                      <div className="space-y-0.5">
                        {(selectedGate.criteria[controlKey] || selectedGate.criteria['Assistive-Low'] || []).map((c, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCircle2 className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />{c}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Sign-offs</p>
                      <div className="flex flex-wrap gap-1">
                        {(selectedGate.signOffs[controlKey] || selectedGate.signOffs['Assistive-Low'] || []).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] no-default-active-elevate border-primary/20 text-primary/80 px-1.5">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Evidence</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedGate.evidence.map((e, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] no-default-active-elevate border-border/50 px-1.5"><FileCheck className="w-2 h-2 mr-0.5 text-muted-foreground" />{e}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2" data-testid="control-swimlanes">
            {controlSwimlanes.map(lane => (
              <div key={lane.id} className="glass-card rounded-lg p-2.5">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">{lane.label}</p>
                <div className="flex gap-0.5">
                  {lane.stages.map((content, i) => (
                    <div key={i} className="flex-1 h-2 rounded-sm transition-colors" style={{ backgroundColor: content ? intensityColor + '35' : 'hsl(217 20% 12%)', boxShadow: content ? `0 0 3px ${intensityColor}20` : 'none' }} title={content || `Stage ${i + 1}: inactive`} />
                  ))}
                </div>
                <p className="text-[8px] text-muted-foreground/60 mt-1">{lane.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" />Implementation Roadmap</span>
            <div className="mt-3 space-y-3">
              {implementationPhases.map((phase, i) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-testid={`phase-${phase.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: i === 0 ? 'hsl(199 89% 48% / 0.15)' : i === 1 ? 'hsl(27 87% 55% / 0.15)' : 'hsl(142 76% 45% / 0.15)', color: i === 0 ? 'hsl(199 89% 48%)' : i === 1 ? 'hsl(27 87% 55%)' : 'hsl(142 76% 45%)' }}>
                      {phase.id}
                    </div>
                    <span className="text-[11px] font-semibold flex-1">{phase.focus}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{phase.timeline}</span>
                  </div>
                  <div className="ml-7 flex flex-wrap gap-1">
                    {phase.tasks.map((t, j) => (
                      <Badge key={j} variant="outline" className="text-[8px] no-default-active-elevate border-border/30 px-1.5">{t}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Crosshair className="w-3 h-3" style={{ color: 'hsl(0 84% 55%)' }} />Red-Team Categories</span>
            <div className="mt-2 space-y-2">
              {redTeamCategories.map((cat) => (
                <div key={cat.id} className="flex items-start gap-2 p-2 rounded-md" style={{ backgroundColor: 'hsl(0 84% 55% / 0.04)', border: '1px solid hsl(0 84% 55% / 0.1)' }} data-testid={`redteam-${cat.id}`}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: cat.severity >= 5 ? 'hsl(0 84% 55% / 0.15)' : 'hsl(27 87% 55% / 0.15)' }}>
                    <Skull className="w-3 h-3" style={{ color: cat.severity >= 5 ? 'hsl(0 84% 55%)' : 'hsl(27 87% 55%)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold">Cat {cat.id}: {cat.name}</span>
                      <Badge variant="outline" className="text-[8px] no-default-active-elevate border-border/30 px-1">{cat.target}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
