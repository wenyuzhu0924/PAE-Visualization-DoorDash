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
  lib/
    data.ts                         - All PAE data (capabilities, tech tags, risk points, lifecycle)
    DashboardContext.tsx             - Global state management with localStorage
  pages/
    Dashboard.tsx                   - Main dashboard layout with sidebar navigation
  components/
    ToggleChips.tsx                  - Reusable company/domain toggle chips
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

## Design Principles

- Minimal text, maximum visual communication
- Insight cards show key stats with icons and numbers, not paragraphs
- Tech map cells use colored left borders (autonomy) and status dots - full badges only in detail panel
- Risk quadrant shows controls as chips/badges, not bulleted lists
- Governance playbook uses progress bars, 2-column detail layout, colored bar swimlanes
- No "How to Read" panels - views are self-explanatory through visual design

## Data Source

All data derived from the PAE First Draft analyzing DoorDash, Uber Eats, Instacart, Grubhub, and Meituan across Consumer AI, Merchant AI, Dispatch AI, Support AI, and Autonomous Hardware domains.
