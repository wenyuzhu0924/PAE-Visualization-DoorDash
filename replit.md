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
    data.ts                         - All PAE data (capabilities, tech tags, risk points, lifecycle, risk domain standards, platform metrics, implementation phases, red-team categories)
    DashboardContext.tsx             - Global state management with localStorage
  pages/
    Dashboard.tsx                   - Main dashboard layout with sidebar navigation
  components/
    ToggleChips.tsx                  - Reusable company/domain toggle chips with icons
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
- 8 domain colors: Brand=purple, Communications=cyan, Public Policy=red, Legal=pink, Insurance=orange, Trust & Safety=crimson, Values Alignment=green, Regulatory=yellow
- 6 stage colors: S1=cyan, S2=purple, S3=orange, S4=red, S5=green, S6=yellow
- Font sizing: minimum text-[10px] for smallest labels, text-xs (12px) for primary content, text-sm/text-base for headers
- Dark scrollbar styling: webkit-scrollbar with dark track/thumb, Firefox scrollbar-color
- No emoji anywhere; lucide-react icons only

## 4-Page Storyline

1. **Industry Landscape** - Market position, capability benchmarking across 5 platforms
2. **Technology Stack** - Agentic AI systems mapped across platforms and domains
3. **Risk Architecture** - Multi-dimensional governance risk positioning and standards
4. **Deployment Playbook** - Lifecycle controls, implementation roadmap, red-teaming

## Design Principles

- Minimal text, maximum visual communication
- Graphs and charts are the absolute visual center of each view
- Dense multi-card grid layouts per page (tech-company keynote aesthetic)
- Insight cards show key stats with icons and numbers, not paragraphs
- Tech map cells use tier icons + colored left borders + status dots
- Risk quadrant shows controls as chips/badges, not bulleted lists
- Governance playbook uses progress bars, 2-column detail layout, colored bar swimlanes
- No "How to Read" panels - views are self-explanatory through visual design

## Data Source

All data derived from the PAE First Draft and Appendices analyzing DoorDash, Uber Eats, Instacart, Grubhub, and Meituan across Consumer AI, Merchant AI, Dispatch AI, Support AI, and Autonomous Hardware domains. Includes detailed governance standards from Appendix I (8 risk domains, 25 requirements) and red-team playbook from Appendix II (4 attack categories, escalation ladder methodology).
