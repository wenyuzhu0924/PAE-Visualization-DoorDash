import { useEffect, useCallback } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Radar, LayoutGrid, Target, BookOpen,
  ChevronLeft, ChevronRight, Maximize, Minimize,
  Presentation, Compass,
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
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
          <div>
            <h1 className="text-lg font-bold tracking-tight gradient-text">Agentic AI Governance</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{STEPS[currentStep].title}</span>
            <Badge variant="outline" className="font-mono text-xs no-default-active-elevate border-primary/30 text-primary">{currentStep + 1} / {STEPS.length}</Badge>
            <Button size="icon" variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })} data-testid="button-exit-presentation">
              <Minimize className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 p-6 tech-grid-bg flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1 min-h-0">
            <StepContent step={currentStep} />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            disabled={currentStep === 0}
            data-testid="button-prev-presentation"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="cursor-pointer rounded-full transition-all duration-300"
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 8,
                  backgroundColor: i === currentStep ? 'hsl(199 89% 48%)' : 'hsl(217 20% 22%)',
                  boxShadow: i === currentStep ? '0 0 8px hsl(199 89% 48% / 0.5)' : 'none',
                }}
                onClick={() => dispatch({ type: 'SET_STEP', step: i })}
                data-testid={`dot-presentation-step-${i}`}
                layout
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
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
    '--sidebar-width': '14rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="px-3 pt-3 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center glow-border-blue">
                      <Target className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-primary/80">DoorDash PAE</span>
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
                              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                              style={{
                                backgroundColor: isActive ? 'hsl(199 89% 48% / 0.15)' : 'transparent',
                                boxShadow: isActive ? '0 0 12px hsl(199 89% 48% / 0.2)' : 'none',
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'hsl(199 89% 48%)' : undefined }} />
                            </div>
                            <span className="text-xs font-medium">{step.title}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="mx-3 w-auto opacity-30" />

            <SidebarGroup>
              <SidebarGroupContent>
                <div className="px-3 space-y-1.5">
                  <button
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors"
                    style={{
                      backgroundColor: mode === 'story' ? 'hsl(199 89% 48% / 0.1)' : 'transparent',
                      color: mode === 'story' ? 'hsl(199 89% 48%)' : undefined,
                    }}
                    onClick={() => dispatch({ type: 'SET_MODE', mode: 'story' })}
                    data-testid="button-story-mode"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    Story
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors"
                    style={{
                      backgroundColor: mode === 'explore' ? 'hsl(199 89% 48% / 0.1)' : 'transparent',
                      color: mode === 'explore' ? 'hsl(199 89% 48%)' : undefined,
                    }}
                    onClick={() => dispatch({ type: 'SET_MODE', mode: 'explore' })}
                    data-testid="button-explore-mode"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Explore
                  </button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-1.5 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-sm font-bold tracking-tight leading-tight gradient-text">Agentic AI Governance Framework</h1>
                <p className="text-[10px] text-muted-foreground/60">Harvard Kennedy School</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })}
              data-testid="button-presentation-mode"
            >
              <Maximize className="w-4 h-4 mr-1" />
              Present
            </Button>
          </header>
          <div className="accent-line" />

          <main className="flex-1 overflow-hidden tech-grid-bg flex flex-col">
            <div className="max-w-7xl mx-auto px-4 pt-2 pb-1 flex-1 w-full flex flex-col min-h-0">
              <div className="mb-1.5 flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 rounded-md flex items-center justify-center glow-border-blue" style={{ backgroundColor: 'hsl(199 89% 48% / 0.1)' }}>
                  {(() => { const Icon = STEP_ICONS[currentStep]; return <Icon className="w-3.5 h-3.5 text-primary" />; })()}
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-tight">{STEPS[currentStep].title}</h2>
                  <p className="text-[10px] text-muted-foreground/70">{STEPS[currentStep].subtitle}</p>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <StepContent step={currentStep} />
              </div>

              {mode === 'story' && (
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/30 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50"
                    onClick={() => dispatch({ type: 'PREV_STEP' })}
                    disabled={currentStep === 0}
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        className="cursor-pointer rounded-full transition-all duration-300"
                        style={{
                          width: i === currentStep ? 24 : 8,
                          height: 8,
                          backgroundColor: i === currentStep ? 'hsl(199 89% 48%)' : 'hsl(217 20% 22%)',
                          boxShadow: i === currentStep ? '0 0 8px hsl(199 89% 48% / 0.5)' : 'none',
                        }}
                        onClick={() => dispatch({ type: 'SET_STEP', step: i })}
                        data-testid={`dot-step-${i}`}
                        layout
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50"
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
