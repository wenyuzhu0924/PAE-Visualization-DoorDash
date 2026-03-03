import { useEffect, useCallback } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (presentationMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Agentic AI Governance Framework</h1>
            <p className="text-xs text-muted-foreground">DoorDash Policy Analysis Exercise</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{STEPS[currentStep].title}</span>
            <Badge variant="outline" className="font-mono text-xs no-default-active-elevate">{currentStep + 1} / {STEPS.length}</Badge>
            <Button size="icon" variant="ghost" onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })} data-testid="button-exit-presentation">
              <Minimize className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <StepContent step={currentStep} />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-2 border-t">
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
          <Progress value={progress} className="w-48 h-1.5" />
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
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs tracking-wider">
                DoorDash Agentic AI
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {STEPS.map((step, i) => {
                    const Icon = STEP_ICONS[i];
                    return (
                      <SidebarMenuItem key={step.id}>
                        <SidebarMenuButton
                          data-active={currentStep === i}
                          onClick={() => dispatch({ type: 'SET_STEP', step: i })}
                          data-testid={`nav-step-${i}`}
                        >
                          <Icon className="w-4 h-4" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{step.title}</span>
                            <span className="text-[10px] text-muted-foreground">{step.subtitle}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="mx-3 w-auto" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Mode</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 space-y-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Button
                      size="sm"
                      variant={mode === 'story' ? 'default' : 'ghost'}
                      onClick={() => dispatch({ type: 'SET_MODE', mode: 'story' })}
                      data-testid="button-story-mode"
                    >
                      Story
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === 'explore' ? 'default' : 'ghost'}
                      onClick={() => dispatch({ type: 'SET_MODE', mode: 'explore' })}
                      data-testid="button-explore-mode"
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {mode === 'story' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs">Progress</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 space-y-2">
                    <Progress value={progress} className="h-1.5" data-testid="progress-bar" />
                    <p className="text-[10px] text-muted-foreground text-center">Step {currentStep + 1} of {STEPS.length}</p>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-base font-bold tracking-tight leading-tight">Agentic AI Governance Framework</h1>
                <p className="text-xs text-muted-foreground">DoorDash Policy Analysis Exercise | Harvard Kennedy School</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION' })}
              data-testid="button-presentation-mode"
            >
              <Maximize className="w-4 h-4 mr-1" />
              Present
            </Button>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  {(() => { const Icon = STEP_ICONS[currentStep]; return <Icon className="w-5 h-5 text-primary" />; })()}
                  <h2 className="text-xl font-bold">{STEPS[currentStep].title}</h2>
                </div>
                <p className="text-sm text-muted-foreground ml-8">{STEPS[currentStep].subtitle}</p>
              </div>

              <StepContent step={currentStep} />

              {mode === 'story' && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => dispatch({ type: 'PREV_STEP' })}
                    disabled={currentStep === 0}
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
                        style={{
                          backgroundColor: i === currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          transform: i === currentStep ? 'scale(1.3)' : 'scale(1)',
                        }}
                        onClick={() => dispatch({ type: 'SET_STEP', step: i })}
                        data-testid={`dot-step-${i}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
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
