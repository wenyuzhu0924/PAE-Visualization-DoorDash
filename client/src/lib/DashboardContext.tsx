import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { COMPANIES, DOMAINS, type Company, type Domain } from './data';

interface DashboardState {
  currentStep: number;
  selectedCompanies: Company[];
  selectedDomains: Domain[];
  highlightedCompany: Company | null;
  mode: 'story' | 'explore';
  presentationMode: boolean;
  autonomyTier: 'Assistive' | 'Conditional' | 'Autonomous';
  exposureLevel: 'Low' | 'High';
}

type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'TOGGLE_COMPANY'; company: Company }
  | { type: 'TOGGLE_DOMAIN'; domain: Domain }
  | { type: 'SET_HIGHLIGHTED'; company: Company | null }
  | { type: 'SET_MODE'; mode: 'story' | 'explore' }
  | { type: 'TOGGLE_PRESENTATION' }
  | { type: 'SET_AUTONOMY_TIER'; tier: 'Assistive' | 'Conditional' | 'Autonomous' }
  | { type: 'SET_EXPOSURE'; level: 'Low' | 'High' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

const defaultState: DashboardState = {
  currentStep: 0,
  selectedCompanies: [...COMPANIES],
  selectedDomains: [...DOMAINS],
  highlightedCompany: null,
  mode: 'story',
  presentationMode: false,
  autonomyTier: 'Autonomous',
  exposureLevel: 'High',
};

function loadState(): DashboardState {
  try {
    const saved = localStorage.getItem('dashboard-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return defaultState;
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'TOGGLE_COMPANY': {
      const has = state.selectedCompanies.includes(action.company);
      if (has && state.selectedCompanies.length === 1) return state;
      return {
        ...state,
        selectedCompanies: has
          ? state.selectedCompanies.filter(c => c !== action.company)
          : [...state.selectedCompanies, action.company],
      };
    }
    case 'TOGGLE_DOMAIN': {
      const has = state.selectedDomains.includes(action.domain);
      if (has && state.selectedDomains.length === 1) return state;
      return {
        ...state,
        selectedDomains: has
          ? state.selectedDomains.filter(d => d !== action.domain)
          : [...state.selectedDomains, action.domain],
      };
    }
    case 'SET_HIGHLIGHTED':
      return { ...state, highlightedCompany: action.company };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'TOGGLE_PRESENTATION':
      return { ...state, presentationMode: !state.presentationMode };
    case 'SET_AUTONOMY_TIER':
      return { ...state, autonomyTier: action.tier };
    case 'SET_EXPOSURE':
      return { ...state, exposureLevel: action.level };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    default:
      return state;
  }
}

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const { highlightedCompany, ...toSave } = state;
    localStorage.setItem('dashboard-state', JSON.stringify(toSave));
  }, [state]);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
