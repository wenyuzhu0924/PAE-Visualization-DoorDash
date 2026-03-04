import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, ChevronRight, AlertTriangle,
  ShieldCheck, X, Sparkles, FileCheck, ClipboardCheck,
  Calendar, Crosshair, Skull, ArrowRight,
  Search, FileText, Workflow, FlaskConical, Rocket, TrendingUp,
  ListChecks, Eye, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/lib/DashboardContext';
import { useThemeColors } from '@/lib/themeColors';
import {
  lifecycleStages, gates, controlSwimlanes, implementationPhases, redTeamCategories,
  STAGE_COLORS_PALETTE,
  type LifecycleStage, type Gate,
} from '@/lib/data';

const STAGE_ICONS = [Search, FileText, Workflow, FlaskConical, Rocket, TrendingUp];
const STAGE_COLORS = STAGE_COLORS_PALETTE;
const SWIMLANE_ICONS: Record<string, typeof Eye> = {
  Monitoring: Eye,
  Compliance: ListChecks,
  Oversight: Users,
};

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
  const tc = useThemeColors();
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(null);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [readinessResults, setReadinessResults] = useState<Record<number, { passed: boolean; missing: string[] }>>({});
  const [completedControls, setCompletedControls] = useState<Set<string>>(new Set());

  const controlKey = getControlKey(autonomyTier, exposureLevel);

  const intensityLevel = autonomyTier === 'Autonomous' && exposureLevel === 'High' ? 'Maximum'
    : autonomyTier === 'Autonomous' || exposureLevel === 'High' ? 'Elevated' : 'Standard';

  const intensityColor = intensityLevel === 'Maximum' ? '#EC4899'
    : intensityLevel === 'Elevated' ? '#EAB308' : '#14B8A6';

  const intensityGlow = intensityLevel === 'Maximum' ? 'glow-border-pink'
    : intensityLevel === 'Elevated' ? 'glow-border-gold' : 'glow-border-teal';

  const totalControls = useMemo(() => {
    return lifecycleStages.reduce((sum, s) => sum + (s.mandatoryControls[controlKey] || []).length, 0);
  }, [controlKey]);

  const completedCount = useMemo(() => {
    return lifecycleStages.reduce((sum, s) => {
      return sum + (s.mandatoryControls[controlKey] || []).filter(c => completedControls.has(`${s.id}-${c}`)).length;
    }, 0);
  }, [controlKey, completedControls]);

  const overallProgress = totalControls > 0 ? (completedCount / totalControls) * 100 : 0;

  const PHASE_COLORS = ['#22D3EE', '#EAB308', '#14B8A6'];
  const SEVERITY_COLORS = ['#14B8A6', '#22D3EE', '#EAB308', '#EC4899', '#EC4899'];

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Select value={autonomyTier} onValueChange={(v) => dispatch({ type: 'SET_AUTONOMY_TIER', tier: v as any })}>
            <SelectTrigger className="w-[120px] h-7 text-[11px] border-border/30 bg-transparent" data-testid="select-autonomy-tier"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistive">Assistive</SelectItem>
              <SelectItem value="Conditional">Conditional</SelectItem>
              <SelectItem value="Autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exposureLevel} onValueChange={(v) => dispatch({ type: 'SET_EXPOSURE', level: v as any })}>
            <SelectTrigger className="w-[80px] h-7 text-[11px] border-border/30 bg-transparent" data-testid="select-exposure-level"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="no-default-active-elevate text-[10px] px-2 py-0.5" style={{ backgroundColor: intensityColor + '15', color: intensityColor, border: `1px solid ${intensityColor}25` }}>{intensityLevel}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: tc.barTrackBg }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: intensityColor, boxShadow: `0 0 8px ${intensityColor}60` }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/40">{completedCount}/{totalControls}</span>
          </div>
          <Button
            variant="ghost" size="sm"
            className="text-[10px] h-6 px-2 text-muted-foreground/50 hover:text-primary"
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

      <div className="glass-card rounded-xl p-3 glow-border-blue flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Lifecycle Pipeline</span>
          <span className="text-[9px] text-muted-foreground/25">Click stage or gate</span>
        </div>
        <div className="flex items-center gap-0 overflow-x-auto pb-1" data-testid="lifecycle-pipeline">
          {lifecycleStages.map((stage, i) => {
            const controls = stage.mandatoryControls[controlKey] || stage.mandatoryControls['Assistive-Low'] || [];
            const stageCompleted = controls.filter(c => completedControls.has(`${stage.id}-${c}`)).length;
            const readiness = readinessResults[stage.id];
            const isSelected = selectedStage?.id === stage.id;
            const gateAfter = i < gates.length ? gates[i] : null;
            const progress = controls.length > 0 ? (stageCompleted / controls.length) * 100 : 0;
            const StageIcon = STAGE_ICONS[i];
            const stageColor = STAGE_COLORS[i];

            return (
              <div key={stage.id} className="flex items-center flex-1 min-w-0">
                <motion.div
                  className={`cursor-pointer rounded-lg glass-card overflow-hidden transition-all duration-200 flex-1 min-w-0 ${isSelected ? 'glow-border-blue' : readiness ? (readiness.passed ? 'glow-border-green' : 'glow-border-red') : ''}`}
                  onClick={() => { setSelectedStage(isSelected ? null : stage); setSelectedGate(null); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  data-testid={`stage-card-${stage.id}`}
                >
                  <div className="h-0.5 rounded-t-lg" style={{ background: `linear-gradient(90deg, ${stageColor}, ${stageColor}80)`, boxShadow: `0 0 8px ${stageColor}40` }} />
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stageColor + '12', boxShadow: `0 0 12px ${stageColor}15` }}>
                        <StageIcon className="w-3.5 h-3.5" style={{ color: stageColor, filter: `drop-shadow(0 0 3px ${stageColor}60)` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold leading-tight truncate">{stage.shortTitle}</p>
                      </div>
                      {readiness && (readiness.passed ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#14B8A6' }} /> : <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#EC4899' }} />)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: tc.barTrackBg }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: stageColor, boxShadow: `0 0 8px ${stageColor}60` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground/30">controls</span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: stageCompleted === controls.length && controls.length > 0 ? '#14B8A6' : stageColor }}>
                          {stageCompleted}/{controls.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {gateAfter && (
                  <motion.div
                    className="flex items-center justify-center px-0.5 cursor-pointer flex-shrink-0"
                    onClick={() => { setSelectedGate(selectedGate?.id === gateAfter.id ? null : gateAfter); setSelectedStage(null); }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.04, type: 'spring', stiffness: 300 }}
                    data-testid={`gate-${gateAfter.id}`}
                  >
                    <div className="flex items-center gap-0">
                      <div className="w-3 h-px" style={{ backgroundColor: intensityColor + '30' }} />
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ border: `1.5px solid ${selectedGate?.id === gateAfter.id ? '#22D3EE' : intensityColor + '40'}`, color: intensityColor, backgroundColor: selectedGate?.id === gateAfter.id ? '#22D3EE12' : 'transparent', boxShadow: selectedGate?.id === gateAfter.id ? '0 0 10px #22D3EE30' : `0 0 4px ${intensityColor}10` }}>
                        G{gateAfter.id}
                      </div>
                      <div className="w-3 h-px" style={{ backgroundColor: intensityColor + '30' }} />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
        <div className="flex flex-col gap-2 lg:col-span-2 min-h-0">
          <AnimatePresence mode="wait">
            {selectedStage ? (
              <motion.div key="stage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex-1 min-h-0 flex flex-col">
                <div className={`glass-card-elevated rounded-xl ${intensityGlow} flex-1 min-h-0 flex flex-col`}>
                  <div className="p-3 border-b border-border/20 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: STAGE_COLORS[selectedStage.id - 1] + '15' }}>
                          {(() => { const SI = STAGE_ICONS[selectedStage.id - 1]; return <SI className="w-3.5 h-3.5" style={{ color: STAGE_COLORS[selectedStage.id - 1], filter: `drop-shadow(0 0 3px ${STAGE_COLORS[selectedStage.id - 1]}60)` }} />; })()}
                        </div>
                        <span className="font-mono text-[10px]" style={{ color: STAGE_COLORS[selectedStage.id - 1] }}>S{selectedStage.id}</span>
                        <span className="text-xs">{selectedStage.title}</span>
                      </div>
                      <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground/40" onClick={() => setSelectedStage(null)} data-testid="button-close-stage"><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground/60 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" style={{ color: STAGE_COLORS[selectedStage.id - 1] }} />Controls</p>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary/60 hover:text-primary" onClick={() => { const controls = selectedStage.mandatoryControls[controlKey] || []; const next = new Set(completedControls); controls.forEach(c => next.add(`${selectedStage.id}-${c}`)); setCompletedControls(next); }} data-testid="button-auto-populate">
                          <Sparkles className="w-3 h-3 mr-0.5" />All
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {(selectedStage.mandatoryControls[controlKey] || []).map((control, i) => {
                          const controlId = `${selectedStage.id}-${control}`;
                          const isDone = completedControls.has(controlId);
                          return (
                            <motion.div
                              key={i}
                              className="flex items-center gap-2.5 text-sm p-2 rounded-lg cursor-pointer transition-colors"
                              style={{
                                backgroundColor: isDone ? 'hsl(160 60% 40% / 0.06)' : 'hsl(220 20% 14% / 0.5)',
                                border: `1px solid ${isDone ? 'hsl(160 60% 40% / 0.12)' : 'hsl(220 20% 18% / 0.4)'}`,
                              }}
                              onClick={() => { const next = new Set(completedControls); if (isDone) next.delete(controlId); else next.add(controlId); setCompletedControls(next); }}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              whileHover={{ backgroundColor: 'hsl(220 20% 16% / 0.7)' }}
                              data-testid={`control-check-${selectedStage.id}-${i}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#14B8A6' }} /> : <div className="w-4 h-4 rounded-full border-[1.5px] flex-shrink-0" style={{ borderColor: STAGE_COLORS[selectedStage.id - 1] + '60' }} />}
                              <span className={isDone ? 'line-through text-muted-foreground/40' : 'text-foreground/90'}>{control}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground/60 mb-2 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-primary/50" />Deliverables</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStage.deliverables.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs no-default-active-elevate border-border/20 px-2 py-1">
                              <ClipboardCheck className="w-3 h-3 mr-1.5" style={{ color: '#14B8A660' }} />{d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground/60 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />Failure Modes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStage.failureModes.map((mode, i) => (
                            <Badge key={i} variant="outline" className="text-xs no-default-active-elevate px-2 py-1" style={{ borderColor: '#EC489925', color: '#EC4899CC' }}>
                              <AlertTriangle className="w-3 h-3 mr-1.5" />{mode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : selectedGate ? (
              <motion.div key="gate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex-1 min-h-0 flex flex-col">
                <div className="glass-card-elevated rounded-xl glow-border-blue flex-1 min-h-0 flex flex-col">
                  <div className="p-4 border-b border-border/20 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ border: `2px solid ${intensityColor}`, color: intensityColor, boxShadow: `0 0 10px ${intensityColor}25` }}>G{selectedGate.id}</span>
                        <span className="text-sm font-semibold text-foreground/90">{selectedGate.meaning}</span>
                      </div>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground/40" onClick={() => setSelectedGate(null)} data-testid="button-close-gate"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground/60 mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" style={{ color: '#14B8A6' }} />Go/No-Go Criteria</p>
                      <div className="space-y-1.5">
                        {(selectedGate.criteria[controlKey] || selectedGate.criteria['Assistive-Low'] || []).map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 text-sm p-2 rounded-lg"
                            style={{ backgroundColor: 'hsl(220 20% 14% / 0.5)', border: '1px solid hsl(220 20% 18% / 0.4)' }}
                          >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#14B8A6' }} />
                            <span className="text-foreground/85">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground/60 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" style={{ color: intensityColor }} />Required Sign-offs</p>
                      <div className="space-y-1.5">
                        {(selectedGate.signOffs[controlKey] || selectedGate.signOffs['Assistive-Low'] || []).map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 text-sm p-2 rounded-lg"
                            style={{ backgroundColor: 'hsl(192 50% 20% / 0.12)', border: '1px solid hsl(192 50% 40% / 0.15)' }}
                          >
                            <Users className="w-4 h-4 flex-shrink-0" style={{ color: intensityColor }} />
                            <span className="text-foreground/85">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground/60 mb-2 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-primary/50" />Evidence Required</p>
                      <div className="space-y-1.5">
                        {selectedGate.evidence.map((e, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 text-sm p-2 rounded-lg"
                            style={{ backgroundColor: 'hsl(220 20% 14% / 0.5)', border: '1px solid hsl(220 20% 18% / 0.4)' }}
                          >
                            <FileCheck className="w-4 h-4 flex-shrink-0 text-primary/50" />
                            <span className="text-foreground/85">{e}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="swimlanes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 flex-shrink-0" data-testid="control-swimlanes">
                  {controlSwimlanes.map(lane => {
                    const LaneIcon = SWIMLANE_ICONS[lane.label] || Eye;
                    return (
                      <div key={lane.id} className="glass-card rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <LaneIcon className="w-3 h-3" style={{ color: intensityColor }} />
                          <p className="text-[10px] font-semibold text-muted-foreground/50">{lane.label}</p>
                        </div>
                        <div className="flex gap-1">
                          {lane.stages.map((content, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                              <div className="w-full h-2.5 rounded" style={{ backgroundColor: content ? STAGE_COLORS[i] + '30' : tc.heatmapLow, boxShadow: content ? `0 0 6px ${STAGE_COLORS[i]}20` : 'none' }} title={content || `Stage ${i + 1}: inactive`} />
                              <span className="text-[8px] text-muted-foreground/25">S{i + 1}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[9px] text-muted-foreground/30 mt-1">{lane.subtitle}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="glass-card rounded-xl p-4 flex-1 min-h-0 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    {lifecycleStages.map((stage, i) => {
                      const StageIcon = STAGE_ICONS[i];
                      const stageColor = STAGE_COLORS[i];
                      const controls = stage.mandatoryControls[controlKey] || stage.mandatoryControls['Assistive-Low'] || [];
                      const done = controls.filter(c => completedControls.has(`${stage.id}-${c}`)).length;
                      const pct = controls.length > 0 ? (done / controls.length) * 100 : 0;
                      return (
                        <motion.div
                          key={stage.id}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                          onClick={() => { setSelectedStage(stage); setSelectedGate(null); }}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="relative">
                            <svg width="44" height="44" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke={tc.barTrackBg} strokeWidth="2.5" />
                              <motion.circle
                                cx="24" cy="24" r="20" fill="none"
                                stroke={stageColor}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - pct / 100) }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                transform="rotate(-90 24 24)"
                                style={{ filter: `drop-shadow(0 0 4px ${stageColor}50)` }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <StageIcon className="w-4 h-4" style={{ color: stageColor, filter: `drop-shadow(0 0 3px ${stageColor}50)` }} />
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold" style={{ color: stageColor }}>{stage.shortTitle}</span>
                          <span className="text-[9px] text-muted-foreground/30 font-mono">{done}/{controls.length}</span>
                          {i < lifecycleStages.length - 1 && (
                            <div className="absolute" style={{ left: `calc(50% + ${(i - 2.5) * 70 + 35}px)`, top: '50%' }}>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground/25">Click a stage for controls and details</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="glass-card rounded-xl p-3 flex-shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3 text-primary/50" />Roadmap</span>
            <div className="mt-2 relative">
              <div className="absolute left-[8px] top-3 bottom-3 w-px" style={{ background: `linear-gradient(180deg, ${tc.svgDash}, ${tc.barTrackBg})` }} />
              <div className="space-y-3">
                {implementationPhases.map((phase, i) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="relative pl-6"
                    data-testid={`phase-${phase.id}`}
                  >
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: PHASE_COLORS[i] + '15', border: `1.5px solid ${PHASE_COLORS[i]}`, boxShadow: `0 0 8px ${PHASE_COLORS[i]}25` }}>
                      <span className="text-[8px] font-bold" style={{ color: PHASE_COLORS[i] }}>{phase.id}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] font-bold">{phase.focus}</span>
                      <span className="text-[10px] text-muted-foreground/30 font-mono flex-shrink-0">{phase.timeline}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {phase.tasks.map((t, j) => (
                        <span key={j} className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                          <CheckCircle2 className="w-2 h-2 flex-shrink-0" style={{ color: PHASE_COLORS[i] + '60' }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 flex-1 min-h-0 flex flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1 flex-shrink-0"><Crosshair className="w-3 h-3" style={{ color: '#EC4899', filter: 'drop-shadow(0 0 3px #EC489960)' }} />Red-Team</span>
            <div className="mt-2 space-y-2 flex-1 min-h-0">
              {redTeamCategories.map((cat, ci) => {
                const sevColor = SEVERITY_COLORS[Math.min(cat.severity - 1, 4)];
                return (
                  <motion.div
                    key={cat.id}
                    className="glass-card rounded-lg p-2"
                    style={{ boxShadow: `inset 0 0 0 1px ${sevColor}10` }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ci * 0.08 }}
                    data-testid={`redteam-${cat.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sevColor + '12' }}>
                        <Skull className="w-3.5 h-3.5" style={{ color: sevColor, filter: `drop-shadow(0 0 3px ${sevColor}50)` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold">{cat.name}</span>
                          <Badge variant="outline" className="text-[9px] no-default-active-elevate border-border/20 px-1 ml-auto">{cat.target}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <motion.div
                                key={si}
                                className="w-3.5 h-1 rounded-sm"
                                style={{ backgroundColor: si < cat.severity ? sevColor : tc.barTrackBg, boxShadow: si < cat.severity ? `0 0 3px ${sevColor}30` : 'none' }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: ci * 0.08 + si * 0.05 }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground/30">{cat.severity}/5</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
