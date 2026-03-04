# DoorDash Agentic AI Governance Dashboard

Interactive presentation dashboard for a Harvard Kennedy School Policy Analysis Exercise on DoorDash agentic AI governance.

## Architecture

- **Frontend-only visualization app** - All data is embedded in the client
- Built with React + TypeScript + Vite
- Uses Recharts for radar charts, bar charts, pie charts; custom SVG for quadrant visualization
- Framer Motion for animations
- Shadcn UI components
- State managed via React Context + localStorage persistence
- Font: Quicksand (Google Fonts)

## Project Structure

```
client/src/
  App.tsx                           - Main app with routing
  index.css                         - Dark theme CSS with glass/glow utilities
  lib/
    data.ts                         - All PAE data + centralized color constants (TIER_COLORS, RISK_COLORS, STATUS_COLORS, SOURCE_COLORS, STAGE_COLORS_PALETTE, DOMAIN_COLORS_MAP)
    DashboardContext.tsx             - Global state management with localStorage (includes theme toggle)
    themeColors.ts                   - useThemeColors() hook providing theme-aware inline style values
  pages/
    Dashboard.tsx                   - Main dashboard layout with sidebar, StepDots nav, presentation mode
  components/
    ToggleChips.tsx                  - Reusable company/domain toggle chips with icons + glow
    CapabilityComparison.tsx         - Page 1: Industry Landscape - Hero stats, radar chart, rankings, autonomy distribution, heatmap
    CompetitorTechMap.tsx            - Page 2: Technology Stack - Tech matrix grid, source/tier pie charts, system counts
    RiskQuadrant.tsx                 - Page 3: Risk Architecture - 2x2 quadrant, risk weight bar chart, governance standards
    GovernancePlaybook.tsx           - Page 4: Deployment Playbook - Lifecycle pipeline, implementation roadmap, red-team categories, control swimlanes
```

## Key Features

1. **Story Mode** with Next/Back navigation and progress indicator
2. **Explore Mode** for free navigation
3. **Presentation Mode** (fullscreen, keyboard navigation: arrows/space/F/Escape)
4. **4 Dense Multi-Card Visualization Pages**: each page has 4-8 visualization cards in grid layouts
5. **Control Escalation**: Autonomy tier + exposure level selectors that update governance controls
6. **localStorage persistence** for user selections
7. **PAE Data from Appendices**: 8 governance domains, 25 requirements with risk weights/KPIs, 3 implementation phases, 4 red-team attack categories

## Visual Design

- **Day/Night theme toggle** managed via DashboardContext `theme` state + `TOGGLE_THEME` action
  - Dark mode: deep navy bg hsl(220 25% 5%), cyan-blue primary hsl(192 85% 50%), glassmorphism with glow effects
  - Light mode: white bg, DoorDash red/orange primary (#FF3008), clean cards with subtle shadows, no glow effects
  - Theme class managed via JS on `<html>` element; flash-prevention inline script in index.html
  - `useThemeColors()` hook from `lib/themeColors.ts` provides theme-aware inline style values for all components
- **Tech keynote aesthetic**: glassmorphism, glow effects (dark only), gradient text, icon-emphasized navigation
- Glassmorphism cards: `.glass-card`, `.glass-card-elevated` - both have dark/light variants via `.dark` prefix in CSS
- Glow effects: `.glow-blue`, `.glow-border-*` utilities - neon glow in dark mode, subtle shadow in light mode
- Gradient text: `.gradient-text` (teal-blue dark / red-orange light), `.gradient-text-warm`
- Dot grid background: `.tech-grid-bg`, accent line: `.accent-line`, `.accent-line-warm` - all theme-aware
- Scrollbar styling: theme-aware (dark track in dark mode, light track in light mode)
- **Centralized semantic color palette** in data.ts:
  - Company colors: DoorDash #FF3008, Uber Eats #276EF1, Instacart #43B02A, Grubhub #F97316, Meituan #A855F7
  - TIER_COLORS: Assistive=#14B8A6, Conditional=#EAB308, Autonomous=#EC4899
  - RISK_COLORS: Critical=#EC4899, Elevated=#EAB308, Operational=#22D3EE, Standard=#14B8A6
  - STATUS_COLORS: Live=#14B8A6, Pilot=#EAB308
  - SOURCE_COLORS: In-house=#22D3EE, Partner=#818CF8, Mixed=#FB7185
  - STAGE_COLORS_PALETTE: 6 colors for lifecycle stages
  - DOMAIN_COLORS_MAP: 8 colors for governance domains
- Icons: lucide-react only (no emoji), with drop-shadow glow filters
- Font sizing: minimum text-[10px] for decorative labels, text-[11px] for content, text-xs+ for headers

## 4-Page Storyline

1. **Industry Landscape** - Market position, capability benchmarking across 5 platforms
2. **Technology Stack** - Agentic AI systems mapped across platforms and domains
3. **Risk Architecture** - Multi-dimensional governance risk positioning and standards
4. **Deployment Playbook** - Lifecycle controls, implementation roadmap, red-teaming

## Design Principles

- Minimal text, maximum visual communication
- Graphs and charts are the absolute visual center of each view
- Dense multi-card grid layouts per page (tech-company keynote aesthetic)
- All content fits viewport without scrolling (flex flex-col h-full, flex-1 min-h-0)
- Insight cards show key stats with icons and numbers, not paragraphs
- Tech map cells use tier icons + colored left borders + status dots
- Risk quadrant shows controls as chips/badges, not bulleted lists
- Governance playbook uses progress bars, animated rings, colored bar swimlanes
- Navigation: StepDots with icon + progress bar connectors + expanding active label

## Data Source

All data derived from the PAE First Draft and Appendices analyzing DoorDash, Uber Eats, Instacart, Grubhub, and Meituan across Consumer AI, Merchant AI, Dispatch AI, Support AI, and Autonomous Hardware domains. Includes detailed governance standards from Appendix I (8 risk domains, 25 requirements) and red-team playbook from Appendix II (4 attack categories, escalation ladder methodology).
