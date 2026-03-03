import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, ChevronRight, AlertTriangle,
  ShieldCheck, X, Sparkles, FileCheck, ClipboardCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/lib/DashboardContext';
import { lifecycleStages, gates, controlSwimlanes, type LifecycleStage, type Gate } from '@/lib/data';

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
    return lifecycleStages.reduce((sum, s) => {
      const controls = s.mandatoryControls[controlKey] || [];
      return sum + controls.length;
    }, 0);
  }, [controlKey]);

  const completedCount = useMemo(() => {
    return lifecycleStages.reduce((sum, s) => {
      const controls = s.mandatoryControls[controlKey] || [];
      return sum + controls.filter(c => completedControls.has(`${s.id}-${c}`)).length;
    }, 0);
  }, [controlKey, completedControls]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={autonomyTier}
            onValueChange={(v) => dispatch({ type: 'SET_AUTONOMY_TIER', tier: v as any })}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs border-border/50" data-testid="select-autonomy-tier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistive">Assistive</SelectItem>
              <SelectItem value="Conditional">Conditional</SelectItem>
              <SelectItem value="Autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={exposureLevel}
            onValueChange={(v) => dispatch({ type: 'SET_EXPOSURE', level: v as any })}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs border-border/50" data-testid="select-exposure-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            className="no-default-active-elevate text-[10px]"
            style={{ backgroundColor: intensityColor + '20', color: intensityColor, border: `1px solid ${intensityColor}30` }}
          >
            {intensityLevel}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">{completedCount}/{totalControls}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-border/50 text-xs h-8"
          onClick={() => {
            const results: Record<number, { passed: boolean; missing: string[] }> = {};
            lifecycleStages.forEach(s => { results[s.id] = runReadinessCheck(s, controlKey, completedControls); });
            setReadinessResults(results);
          }}
          data-testid="button-readiness-check"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Check Readiness
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2" data-testid="lifecycle-pipeline">
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
                  className={`cursor-pointer rounded-lg glass-card p-3 transition-all duration-200 ${isSelected ? 'glow-border-blue' : readiness ? (readiness.passed ? 'glow-border-green' : 'glow-border-red') : ''}`}
                  style={{
                    width: 140,
                    borderColor: isSelected ? 'hsl(199 89% 48% / 0.4)' : readiness ? (readiness.passed ? 'hsl(142 76% 45% / 0.3)' : 'hsl(0 84% 55% / 0.3)') : undefined,
                    borderTop: `2px solid ${intensityColor}50`,
                  }}
                  onClick={() => { setSelectedStage(isSelected ? null : stage); setSelectedGate(null); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  data-testid={`stage-card-${stage.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-primary/60">S{stage.id}</span>
                    {readiness && (
                      readiness.passed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight mb-2">{stage.shortTitle}</p>
                  <div className="space-y-1">
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(217 20% 15%)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: intensityColor, boxShadow: `0 0 6px ${intensityColor}60` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{stageCompleted}/{controls.length}</span>
                  </div>
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
                    <div className="w-px h-3" style={{ backgroundColor: intensityColor + '40' }} />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors"
                      style={{
                        border: `2px solid ${selectedGate?.id === gateAfter.id ? 'hsl(199 89% 48%)' : intensityColor + '60'}`,
                        color: intensityColor,
                        backgroundColor: selectedGate?.id === gateAfter.id ? 'hsl(199 89% 48% / 0.1)' : 'hsl(222 22% 9%)',
                        boxShadow: selectedGate?.id === gateAfter.id ? '0 0 10px hsl(199 89% 48% / 0.3)' : `0 0 6px ${intensityColor}20`,
                      }}
                    >
                      {gateAfter.id}
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2" data-testid="control-swimlanes">
          {controlSwimlanes.map(lane => (
            <div key={lane.id} className="glass-card rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">{lane.label}</p>
              <div className="flex gap-0.5">
                {lane.stages.map((content, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2.5 rounded-sm transition-colors"
                    style={{
                      backgroundColor: content ? intensityColor + '35' : 'hsl(217 20% 12%)',
                      boxShadow: content ? `0 0 4px ${intensityColor}20` : 'none',
                    }}
                    title={content || `Stage ${i + 1}: inactive`}
                  />
                ))}
              </div>
            </div>
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
            <div className={`glass-card rounded-xl ${intensityGlow}`}>
              <div className="p-3 border-b border-border/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="font-mono text-xs text-primary/60">S{selectedStage.id}</span>
                    {selectedStage.title}
                  </div>
                  <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setSelectedStage(null)} data-testid="button-close-stage">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: intensityColor }} />
                        Controls
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-2 text-primary"
                        onClick={() => {
                          const controls = selectedStage.mandatoryControls[controlKey] || [];
                          const next = new Set(completedControls);
                          controls.forEach(c => next.add(`${selectedStage.id}-${c}`));
                          setCompletedControls(next);
                        }}
                        data-testid="button-auto-populate"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mark all
                      </Button>
                    </div>
                    <div className="space-y-0.5">
                      {(selectedStage.mandatoryControls[controlKey] || []).map((control, i) => {
                        const controlId = `${selectedStage.id}-${control}`;
                        const isDone = completedControls.has(controlId);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer transition-colors hover:bg-white/5"
                            onClick={() => {
                              const next = new Set(completedControls);
                              if (isDone) next.delete(controlId); else next.add(controlId);
                              setCompletedControls(next);
                            }}
                            data-testid={`control-check-${selectedStage.id}-${i}`}
                          >
                            {isDone
                              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                              : <div className="w-3.5 h-3.5 rounded-full border flex-shrink-0" style={{ borderColor: intensityColor + '60' }} />
                            }
                            <span className={isDone ? 'line-through opacity-40' : 'text-muted-foreground'}>{control}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-primary/60" />
                        Deliverables
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStage.deliverables.map((d, i) => {
                          const readiness = readinessResults[selectedStage.id];
                          const isMissing = readiness && !readiness.passed && readiness.missing.some(m => d.toLowerCase().includes(m.toLowerCase().split(' ')[0]));
                          return (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] no-default-active-elevate"
                              style={isMissing ? { borderColor: 'hsl(0 84% 55% / 0.3)', color: 'hsl(0 84% 65%)' } : { borderColor: 'hsl(217 20% 20%)' }}
                            >
                              {isMissing ? <XCircle className="w-2.5 h-2.5 mr-0.5" /> : <ClipboardCheck className="w-2.5 h-2.5 mr-0.5 text-green-400/60" />}
                              {d}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'hsl(0 84% 60%)' }} />
                        Failure Modes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStage.failureModes.map((mode, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] no-default-active-elevate"
                            style={{ borderColor: 'hsl(0 84% 55% / 0.2)', color: 'hsl(0 84% 65%)' }}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            {mode}
                          </Badge>
                        ))}
                      </div>
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card rounded-xl glow-border-blue">
              <div className="p-3 border-b border-border/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ border: `2px solid ${intensityColor}`, color: intensityColor, boxShadow: `0 0 8px ${intensityColor}30` }}
                    >
                      {selectedGate.id}
                    </span>
                    {selectedGate.meaning}
                  </div>
                  <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => setSelectedGate(null)} data-testid="button-close-gate">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Go/No-Go</p>
                    <div className="space-y-1">
                      {(selectedGate.criteria[controlKey] || selectedGate.criteria['Assistive-Low'] || []).map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Sign-offs</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedGate.signOffs[controlKey] || selectedGate.signOffs['Assistive-Low'] || []).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] no-default-active-elevate border-primary/20 text-primary/80">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Evidence</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedGate.evidence.map((e, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] no-default-active-elevate border-border/50">
                          <FileCheck className="w-2.5 h-2.5 mr-0.5 text-muted-foreground" />
                          {e}
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
    </div>
  );
}
