import { useEffect, useCallback } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Radar, LayoutGrid, Target, BookOpen,
  ChevronLeft, ChevronRight, Maximize, Minimize,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardProvider, useDashboard } from '@/lib/DashboardContext';
import { STEPS } from '@/lib/data';
import { CapabilityComparison } from '@/components/CapabilityComparison';
import { CompetitorTechMap } from '@/components/CompetitorTechMap';
import { RiskQuadrant } from '@/components/RiskQuadrant';
import { GovernancePlaybook } from '@/components/GovernancePlaybook';

const STEP_ICONS = [Radar, LayoutGrid, Target, BookOpen];

function StepContent({ step }: { step: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {step === 0 && <CapabilityComparison />}
        {step === 1 && <CompetitorTechMap />}
        {step === 2 && <RiskQuadrant />}
        {step === 3 && <GovernancePlaybook />}
      </motion.div>
    </AnimatePresence>
  );
}

function StepDots({ currentStep, onSelect }: { currentStep: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1" data-testid="step-indicators">
      {STEPS.map((step, i) => {
        const Icon = STEP_ICONS[i];
        const isActive = i === currentStep;
        const isPast = i < currentStep;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex items-center gap-1 transition-all duration-300"
            data-testid={`dot-step-${i}`}
          >
            {i > 0 && (
              <div
                className="h-px transition-all duration-500"
                style={{
                  width: 16,
                  background: isPast
                    ? 'linear-gradient(90deg, hsl(192 85% 50%), hsl(192 85% 50%))'
                    : 'hsl(220 20% 18%)',
                  boxShadow: isPast ? '0 0 4px hsl(192 85% 50% / 0.4)' : 'none',
                }}
              />
            )}
            <motion.div
              className="flex items-center gap-1.5 rounded-full px-1.5 py-1 cursor-pointer"
              style={{
                backgroundColor: isActive ? 'hsl(192 85% 50% / 0.12)' : 'transparent',
                boxShadow: isActive ? '0 0 12px hsl(192 85% 50% / 0.2)' : 'none',
              }}
              layout
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: isActive ? 'hsl(192 85% 50% / 0.2)' : isPast ? 'hsl(192 85% 50% / 0.08)' : 'hsl(220 20% 14%)',
                  border: isActive ? '1.5px solid hsl(192 85% 50% / 0.5)' : '1px solid hsl(220 20% 18%)',
                  boxShadow: isActive ? '0 0 8px hsl(192 85% 50% / 0.3)' : 'none',
                }}
              >
                <Icon className="w-3 h-3" style={{ color: isActive ? 'hsl(192 85% 50%)' : isPast ? 'hsl(192 85% 50% / 0.6)' : 'hsl(215 20% 40%)' }} />
              </div>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[11px] font-semibold pr-1.5 whitespace-nowrap"
                  style={{ color: 'hsl(192 85% 50%)' }}
                >
                  {step.title}
                </motion.span>
              )}
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}

function DashboardInner() {
  const { state, dispatch } = useDashboard();
  const { currentStep, mode, presentationMode } = state;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      dispatch({ type: 'NEXT_STEP' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      dispatch({ type: 'PREV_STEP' });
    } else if (e.key === 'Escape') {
      if (presentationMode) dispatch({ type: 'TOGGLE_PRESENTATION' });
    } else if (e.key === 'f' || e.key === 'F') {
      if (e.target === document.body) dispatch({ type: 'TOGGLE_PRESENTATION' });
    }
  }, [dispatch, presentationMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (presentationMode) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
  }, [presentationMode]);

  if (presentationMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="keynote-header flex items-center justify-between px-6 py-2 border-b border-border/30">
          <h1 className="text-lg font-bold tracking-tight gradient-text">Agentic AI Governance</h1>
          <div className="flex items-center gap-4">
            <StepDots currentStep={currentStep} onSelect={(i) => dispatch({ type: 'SET_STEP', step: i })} />
            <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-primary" onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })} data-testid="button-exit-presentation">
              <Minimize className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="accent-line flex-shrink-0" />
        <div className="flex-1 min-h-0 p-4 tech-grid-bg flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1 min-h-0">
            <StepContent step={currentStep} />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-1.5 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            disabled={currentStep === 0}
            data-testid="button-prev-presentation"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <span className="text-xs font-mono text-muted-foreground/40">{currentStep + 1} / {STEPS.length}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            disabled={currentStep === STEPS.length - 1}
            data-testid="button-next-presentation"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  const sidebarStyle = {
    '--sidebar-width': '11rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center glow-border-blue">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-primary/70">DoorDash</span>
                      <span className="text-[9px] text-muted-foreground/50 tracking-wider uppercase">PAE Analysis</span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {STEPS.map((step, i) => {
                    const Icon = STEP_ICONS[i];
                    const isActive = currentStep === i;
                    return (
                      <SidebarMenuItem key={step.id}>
                        <SidebarMenuButton
                          data-active={isActive}
                          onClick={() => dispatch({ type: 'SET_STEP', step: i })}
                          data-testid={`nav-step-${i}`}
                          className="relative"
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                              style={{
                                backgroundColor: isActive ? 'hsl(192 85% 50% / 0.15)' : 'transparent',
                                border: isActive ? '1px solid hsl(192 85% 50% / 0.25)' : '1px solid transparent',
                                boxShadow: isActive ? '0 0 16px hsl(192 85% 50% / 0.15)' : 'none',
                              }}
                            >
                              <Icon className="w-4 h-4 transition-colors duration-300" style={{ color: isActive ? 'hsl(192 85% 50%)' : 'hsl(215 20% 40%)' }} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold leading-tight">{step.title}</span>
                              <span className="text-[9px] text-muted-foreground/40">{i + 1} of {STEPS.length}</span>
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="nav-active"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                              style={{ backgroundColor: 'hsl(192 85% 50%)', boxShadow: '0 0 8px hsl(192 85% 50% / 0.5)' }}
                            />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="keynote-header flex items-center justify-between gap-2 px-4 py-1.5 border-b border-border/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-base font-bold tracking-tight leading-tight gradient-text">Agentic AI Governance</h1>
              <span className="text-[10px] text-muted-foreground/30 font-mono tracking-wider uppercase hidden md:block">Harvard Kennedy School</span>
            </div>
            <div className="flex items-center gap-3">
              <StepDots currentStep={currentStep} onSelect={(i) => dispatch({ type: 'SET_STEP', step: i })} />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground/50 hover:text-primary w-7 h-7"
                onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })}
                data-testid="button-presentation-mode"
              >
                <Maximize className="w-3.5 h-3.5" />
              </Button>
            </div>
          </header>
          <div className="accent-line flex-shrink-0" />

          <main className="flex-1 overflow-hidden tech-grid-bg flex flex-col min-h-0">
            <div className="max-w-7xl mx-auto px-4 py-2 flex-1 w-full flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <StepContent step={currentStep} />
              </div>

              {mode === 'story' && (
                <div className="flex items-center justify-between pt-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground/50 hover:text-primary"
                    onClick={() => dispatch({ type: 'PREV_STEP' })}
                    disabled={currentStep === 0}
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <span className="text-[10px] font-mono text-muted-foreground/30">{currentStep + 1} / {STEPS.length}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground/50 hover:text-primary"
                    onClick={() => dispatch({ type: 'NEXT_STEP' })}
                    disabled={currentStep === STEPS.length - 1}
                    data-testid="button-next"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
