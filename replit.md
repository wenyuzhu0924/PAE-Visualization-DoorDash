# DoorDash Agentic AI Governance Dashboard

Interactive presentation dashboard for a Harvard Kennedy School Policy Analysis Exercise on DoorDash agentic AI governance.

## Architecture

- **Frontend-only visualization app** - All data is embedded in the client
- Built with React + TypeScript + Vite
- Uses Recharts for radar charts, custom SVG for quadrant visualization
- Framer Motion for animations
- Shadcn UI components
- State managed via React Context + localStorage persistence

## Project Structure

```
client/src/
  App.tsx                           - Main app with routing
  index.css                         - Dark theme CSS with glass/glow utilities
  lib/
    data.ts                         - All PAE data (capabilities, tech tags, risk points, lifecycle)
    DashboardContext.tsx             - Global state management with localStorage
  pages/
    Dashboard.tsx                   - Main dashboard layout with sidebar navigation
  components/
    ToggleChips.tsx                  - Reusable company/domain toggle chips with icons
    CapabilityComparison.tsx         - Step 1: Radar chart + Heatmap + Stat insight cards
    CompetitorTechMap.tsx            - Step 2: Technology matrix with autonomy-colored cells
    RiskQuadrant.tsx                 - Step 3: 2x2 risk quadrant with chip-based details
    GovernancePlaybook.tsx           - Step 4: Stage-gated lifecycle with progress bars
```

## Key Features

1. **Story Mode** with Next/Back navigation and progress indicator
2. **Explore Mode** for free navigation
3. **Presentation Mode** (fullscreen, keyboard navigation: arrows/space/F/Escape)
4. **4 Interactive Visualizations**: Capability radar/heatmap, tech matrix, risk quadrant, governance playbook
5. **Control Escalation**: Autonomy tier + exposure level selectors that update governance controls
6. **localStorage persistence** for user selections

## Visual Design

- **Dark theme by default** (class="dark" on html element)
- Deep navy/charcoal background (hsl 222 25% 6%) with subtle blue tint
- Electric blue primary (hsl 199 89% 48%) with cyan/teal accents
- Glassmorphism cards (`.glass-card` utility) with backdrop blur and subtle borders
- Glow effects (`.glow-blue`, `.glow-border-*` utilities) for emphasis
- Gradient text (`.gradient-text`) for headers
- Subtle dot grid background (`.tech-grid-bg`) on main content area
- Accent line (`.accent-line`) gradient separator under header
- Company colors: DoorDash #FF3008, Uber Eats #276EF1, Instacart #43B02A, Grubhub #F97316, Meituan #A855F7
- Autonomy tiers: Shield icon (Assistive/blue), AlertTriangle (Conditional/orange), Zap (Autonomous/red)
- No emoji anywhere; lucide-react icons only

## Design Principles

- Minimal text, maximum visual communication
- Graphs and charts are the absolute visual center of each view
- Insight cards show key stats with icons and numbers, not paragraphs
- Tech map cells use tier icons + colored left borders + status dots
- Risk quadrant shows controls as chips/badges, not bulleted lists
- Governance playbook uses progress bars, 2-column detail layout, colored bar swimlanes
- No "How to Read" panels - views are self-explanatory through visual design

## Data Source

All data derived from the PAE First Draft analyzing DoorDash, Uber Eats, Instacart, Grubhub, and Meituan across Consumer AI, Merchant AI, Dispatch AI, Support AI, and Autonomous Hardware domains.
