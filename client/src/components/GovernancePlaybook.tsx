import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, ChevronRight, AlertTriangle,
  ShieldCheck, X, Sparkles, FileText,
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

  const intensityColor = intensityLevel === 'Maximum' ? 'hsl(0 84% 45%)'
    : intensityLevel === 'Elevated' ? 'hsl(27 87% 50%)' : 'hsl(142 76% 36%)';

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
          <div className="self-end flex items-center gap-2">
            <Badge className="no-default-active-elevate" style={{ backgroundColor: intensityColor, color: '#fff' }}>
              {intensityLevel}
            </Badge>
            <span className="text-xs text-muted-foreground">{completedCount}/{totalControls} controls</span>
          </div>
        </div>

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
          <ShieldCheck className="w-4 h-4 mr-1" />
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

            return (
              <div key={stage.id} className="flex items-stretch flex-shrink-0">
                <motion.div
                  className="cursor-pointer rounded-md border p-3 transition-all duration-200"
                  style={{
                    width: 150,
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
                    <span className="text-[10px] font-mono text-muted-foreground">S{stage.id}</span>
                    {readiness && (
                      readiness.passed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : <XCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight mb-1.5">{stage.shortTitle}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: controls.length > 0 ? `${(stageCompleted / controls.length) * 100}%` : '0%',
                          backgroundColor: intensityColor,
                        }}
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
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <div className="flex gap-0.5">
                  {lane.stages.map((content, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded-sm transition-colors"
                      style={{
                        backgroundColor: content ? intensityColor + '40' : 'hsl(var(--muted))',
                      }}
                      title={content || `Stage ${i + 1}: inactive`}
                    />
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
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">S{selectedStage.id}</span>
                    {selectedStage.title}
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedStage(null)} data-testid="button-close-stage">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: intensityColor }} />
                        Controls ({autonomyTier} / {exposureLevel})
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
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
                    <div className="space-y-1">
                      {(selectedStage.mandatoryControls[controlKey] || []).map((control, i) => {
                        const controlId = `${selectedStage.id}-${control}`;
                        const isDone = completedControls.has(controlId);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => {
                              const next = new Set(completedControls);
                              if (isDone) next.delete(controlId); else next.add(controlId);
                              setCompletedControls(next);
                            }}
                            data-testid={`control-check-${selectedStage.id}-${i}`}
                          >
                            {isDone
                              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                              : <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0" style={{ borderColor: intensityColor }} />
                            }
                            <span className={isDone ? 'line-through opacity-50' : ''}>{control}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
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
                              style={isMissing ? { borderColor: 'hsl(0 84% 45%)', color: 'hsl(0 84% 45%)' } : {}}
                            >
                              {isMissing ? <XCircle className="w-2.5 h-2.5 mr-0.5" /> : <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-green-500" />}
                              {d}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                        Failure Modes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStage.failureModes.map((mode, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] no-default-active-elevate"
                            style={{ borderColor: 'hsl(0 84% 45% / 0.3)', color: 'hsl(0 84% 45%)' }}
                          >
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
                  <CardTitle className="text-sm flex items-center gap-2">
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
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Go/No-Go</p>
                    <div className="space-y-1">
                      {(selectedGate.criteria[controlKey] || selectedGate.criteria['Assistive-Low'] || []).map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Sign-offs</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedGate.signOffs[controlKey] || selectedGate.signOffs['Assistive-Low'] || []).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] no-default-active-elevate">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Evidence</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedGate.evidence.map((e, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] no-default-active-elevate">
                          <FileText className="w-2.5 h-2.5 mr-0.5" />
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
