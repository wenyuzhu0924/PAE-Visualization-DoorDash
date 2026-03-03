export const COMPANIES = ['DoorDash', 'Uber Eats', 'Instacart', 'Grubhub', 'Meituan'] as const;
export type Company = typeof COMPANIES[number];

export const DOMAINS = ['Consumer AI', 'Merchant AI', 'Dispatch AI', 'Support AI', 'Autonomous Hardware'] as const;
export type Domain = typeof DOMAINS[number];

export const COMPANY_COLORS: Record<Company, string> = {
  DoorDash: '#FF3008',
  'Uber Eats': '#276EF1',
  Instacart: '#43B02A',
  Grubhub: '#F97316',
  Meituan: '#A855F7',
};

export const capabilityScores: Record<Company, Record<Domain, number>> = {
  DoorDash: { 'Consumer AI': 3, 'Merchant AI': 5, 'Dispatch AI': 5, 'Support AI': 5, 'Autonomous Hardware': 5 },
  'Uber Eats': { 'Consumer AI': 5, 'Merchant AI': 4, 'Dispatch AI': 5, 'Support AI': 4, 'Autonomous Hardware': 4 },
  Instacart: { 'Consumer AI': 5, 'Merchant AI': 4, 'Dispatch AI': 4, 'Support AI': 4, 'Autonomous Hardware': 3 },
  Grubhub: { 'Consumer AI': 2, 'Merchant AI': 3, 'Dispatch AI': 3, 'Support AI': 3, 'Autonomous Hardware': 2 },
  Meituan: { 'Consumer AI': 4, 'Merchant AI': 4, 'Dispatch AI': 5, 'Support AI': 4, 'Autonomous Hardware': 4 },
};

export type TechStatus = 'Live' | 'Pilot';
export type TechSource = 'In-house' | 'Partner' | 'Mixed';
export type AutonomyTier = 'Assistive' | 'Conditional' | 'Autonomous';

export interface TechTag {
  label: string;
  status: TechStatus;
  source: TechSource;
  autonomy: AutonomyTier;
  description: string;
  riskNote: string;
}

export const techTags: Record<Company, Record<Domain, TechTag[]>> = {
  DoorDash: {
    'Consumer AI': [
      { label: 'DashAI', status: 'Pilot', source: 'In-house', autonomy: 'Assistive', description: 'Conversational AI for menu discovery and ordering assistance with limited rollout.', riskNote: 'Low current risk due to pilot scope; risk increases if scaled to autonomous ordering.' },
    ],
    'Merchant AI': [
      { label: 'SmartScale', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'AI-powered order accuracy verification system for merchants.', riskNote: 'Moderate risk: incorrect accuracy flags could affect merchant ratings and revenue.' },
      { label: 'AI Menu Photos', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'Automated food photography generation for merchant listings.', riskNote: 'Brand risk if generated images misrepresent actual menu items (BR02).' },
      { label: 'Description Gen', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'AI-generated menu item descriptions for merchant partners.', riskNote: 'IP risk if descriptions infringe trademarks or hallucinate ingredients (LG02, TS02).' },
    ],
    'Dispatch AI': [
      { label: 'ADP', status: 'Live', source: 'In-house', autonomy: 'Autonomous', description: 'Autonomous Delivery Platform orchestrating humans, robots (Dot), and drones across multi-modal fulfillment.', riskNote: 'Critical: autonomous dispatch affects Dasher earnings, safety routing, and labor classification (PP01, PP02, IN01).' },
    ],
    'Support AI': [
      { label: 'AWS Bedrock + Claude', status: 'Live', source: 'Partner', autonomy: 'Autonomous', description: 'Generative AI contact center automating 35,000+ daily interactions with 94% resolution rate and <2.5s latency.', riskNote: 'Critical: autonomous refund authority, contractual hallucination risk (LG01), frustration handoff gaps (CM03).' },
    ],
    'Autonomous Hardware': [
      { label: 'Dot Robot', status: 'Pilot', source: 'In-house', autonomy: 'Autonomous', description: 'In-house electric delivery robot: 20 mph, 30 lb payload, swappable batteries, 360-degree sensor fusion.', riskNote: 'Critical: physical safety risk, insurance liability, pedestrian interaction (IN01).' },
      { label: 'Wing Drones', status: 'Live', source: 'Partner', autonomy: 'Autonomous', description: 'Aerial drone delivery partnership for suburban and low-density areas.', riskNote: 'Regulatory risk: FAA compliance, airspace restrictions, weather dependency.' },
      { label: 'Serve Robotics', status: 'Live', source: 'Partner', autonomy: 'Autonomous', description: 'Sidewalk delivery robots for dense urban environments.', riskNote: 'Physical safety risk in shared pedestrian spaces; municipal regulation variance.' },
    ],
  },
  'Uber Eats': {
    'Consumer AI': [
      { label: 'Gemini Integration', status: 'Live', source: 'Partner', autonomy: 'Conditional', description: 'Google Gemini-powered conversational ordering with strong re-ordering capabilities.', riskNote: 'Moderate: third-party model governance dependency; data sharing with Google.' },
    ],
    'Merchant AI': [
      { label: 'Menu Summarization', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'AI-powered menu and review summarization agents with merchant ads integration.', riskNote: 'Low risk: assistive only; potential bias in review summarization.' },
    ],
    'Dispatch AI': [
      { label: 'Cross-Network Dispatch', status: 'Live', source: 'In-house', autonomy: 'Autonomous', description: 'Integrated mobility-delivery dispatch enabling cross-dispatching drivers between ride-hail and delivery.', riskNote: 'Critical: affects driver earnings across two labor pools; algorithmic wage impact (PP02).' },
    ],
    'Support AI': [
      { label: 'GenAI Gateway', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Centralized gateway supporting 60+ internal and customer-facing AI use cases with unified logging.', riskNote: 'Moderate: centralized architecture creates single-point governance but also single-point failure risk.' },
    ],
    'Autonomous Hardware': [
      { label: 'Waymo Partnership', status: 'Pilot', source: 'Partner', autonomy: 'Autonomous', description: 'Autonomous vehicle delivery partnership; spun out robotics division.', riskNote: 'High: physical safety risk; less strategic control due to partnership model.' },
      { label: 'Cartken Robots', status: 'Pilot', source: 'Partner', autonomy: 'Autonomous', description: 'Sidewalk delivery robot partnership for campus and suburban areas.', riskNote: 'Moderate: limited deployment scope reduces risk; partnership governance gaps.' },
    ],
  },
  Instacart: {
    'Consumer AI': [
      { label: 'Ask Instacart', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Advanced NLP grocery discovery built on proprietary product graph linking recipes, dietary constraints, and inventory.', riskNote: 'Moderate: food safety risk if dietary/allergy recommendations are incorrect (TS02).' },
      { label: 'OpenAI Operator', status: 'Live', source: 'Partner', autonomy: 'Conditional', description: 'Partnership enabling AI systems to autonomously generate shopping lists and populate carts.', riskNote: 'High: AI-mediated commerce where user intent is processed by autonomous systems.' },
    ],
    'Merchant AI': [
      { label: 'CPG Ad Targeting', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'Consumer packaged goods brand advertising and targeting platform.', riskNote: 'Low: assistive ad targeting; potential bias in brand visibility (VA03).' },
    ],
    'Dispatch AI': [
      { label: 'Grocery Batching', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Optimized batching algorithms for complex grocery picking sequences.', riskNote: 'Moderate: affects shopper earnings through order batching efficiency.' },
    ],
    'Support AI': [
      { label: 'LACE Framework', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'High automation in refund and replacement handling for grocery orders.', riskNote: 'Moderate: automated refund/replacement decisions with financial impact.' },
    ],
    'Autonomous Hardware': [
      { label: 'Caper Smart Carts', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'AI-powered smart shopping carts for physical retail, not delivery robots.', riskNote: 'Low: retail-focused assistive hardware; limited autonomy risk.' },
    ],
  },
  Grubhub: {
    'Consumer AI': [
      { label: 'JET AI Assistant', status: 'Pilot', source: 'In-house', autonomy: 'Assistive', description: 'Just Eat Takeaway AI assistant with less mature capabilities than competitors.', riskNote: 'Low current risk due to limited maturity and pilot scope.' },
    ],
    'Merchant AI': [
      { label: 'AI Menu Ingestion', status: 'Live', source: 'In-house', autonomy: 'Assistive', description: 'Automated menu digitization and ingestion system.', riskNote: 'Low: assistive tool; accuracy errors could affect merchant listings.' },
    ],
    'Dispatch AI': [
      { label: 'Nash AI Dispatch', status: 'Live', source: 'Partner', autonomy: 'Conditional', description: 'Third-party dispatch optimization through Nash AI partnership.', riskNote: 'Moderate: less strategic control over core dispatch logic; governance fragmented across partner.' },
    ],
    'Support AI': [
      { label: 'Nash Auto-Support', status: 'Live', source: 'Partner', autonomy: 'Conditional', description: 'Automated dispatch and customer support via Nash partnership.', riskNote: 'Moderate: partner dependency for customer-facing support decisions.' },
    ],
    'Autonomous Hardware': [
      { label: 'Kiwibot Campus', status: 'Pilot', source: 'Partner', autonomy: 'Assistive', description: 'Limited campus delivery robot testing through Kiwibot partnership.', riskNote: 'Low: very limited scope; campus environments with controlled conditions.' },
    ],
  },
  Meituan: {
    'Consumer AI': [
      { label: 'Discovery AI', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Integrated local commerce discovery and personalization engine.', riskNote: 'Moderate: personalization can create filter bubbles and merchant neutrality issues.' },
    ],
    'Merchant AI': [
      { label: 'Merchant Analytics', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Comprehensive merchant analytics and operations platform.', riskNote: 'Moderate: analytics-driven recommendations could create merchant dependency.' },
    ],
    'Dispatch AI': [
      { label: 'National Dispatch Engine', status: 'Live', source: 'In-house', autonomy: 'Autonomous', description: 'Billions of daily routing decisions integrating traffic, courier availability, demand forecasts, and dynamic batching.', riskNote: 'Critical: most advanced dispatch system globally; massive scale amplifies any governance failures.' },
    ],
    'Support AI': [
      { label: 'Auto-Support System', status: 'Live', source: 'In-house', autonomy: 'Conditional', description: 'Large-scale automated customer support system for Chinese market.', riskNote: 'Moderate: regulatory environment differs from US/EU; data sovereignty concerns.' },
    ],
    'Autonomous Hardware': [
      { label: 'Drone Delivery', status: 'Pilot', source: 'In-house', autonomy: 'Autonomous', description: 'Autonomous drone delivery trials in select Chinese cities.', riskNote: 'High: physical safety risk; Chinese regulatory framework differs significantly.' },
      { label: 'Autonomous Vehicles', status: 'Pilot', source: 'In-house', autonomy: 'Autonomous', description: 'Self-driving delivery vehicle development for urban environments.', riskNote: 'Critical: full vehicle autonomy in public roads; highest physical safety risk category.' },
    ],
  },
};

export interface RiskPoint {
  id: string;
  label: string;
  company: Company;
  x: number;
  y: number;
  description: string;
  controls: string[];
}

export const riskPoints: RiskPoint[] = [
  { id: 'dd-adp', label: 'ADP Dispatch', company: 'DoorDash', x: 90, y: 85, description: 'Autonomous multi-modal dispatch orchestrating humans, robots, and drones. Directly affects Dasher earnings and delivery safety.', controls: ['Earnings floor monitoring (PP02)', 'Safety route blacklisting (IN01)', 'Dasher independence audit (PP01)', 'Real-time dispatch fairness metrics (VA01)'] },
  { id: 'dd-support', label: 'AI Support Center', company: 'DoorDash', x: 85, y: 80, description: '35,000+ daily automated interactions with autonomous refund authority. 94% resolution rate via AWS Bedrock + Claude.', controls: ['Refund cap enforcement (LG01)', 'Frustration handoff <45s (CM03)', 'Bot disclosure on first turn (CM01)', 'Decision explainability (CM02)'] },
  { id: 'dd-safechat', label: 'SafeChat+', company: 'DoorDash', x: 80, y: 75, description: 'Real-time harassment detection monitoring 1,400+ messages per minute with autonomous intervention capability.', controls: ['>99% recall for severe threats (TS01)', 'PII auto-redaction', 'False positive review process', 'Appeal pathway for flagged users'] },
  { id: 'dd-dot', label: 'Dot Robot', company: 'DoorDash', x: 85, y: 60, description: 'In-house autonomous delivery robot operating in mixed urban environments at 20 mph with sensor fusion.', controls: ['Physical safety routing (IN01)', 'Insurance scope compliance (IN03)', 'Pedestrian interaction protocols', 'Weather tolerance thresholds'] },
  { id: 'dd-dashai', label: 'DashAI', company: 'DoorDash', x: 20, y: 55, description: 'Pilot consumer chatbot for menu discovery with limited rollout and human oversight.', controls: ['Standard content moderation', 'Food safety advisory prohibition (TS02)', 'Data privacy compliance'] },
  { id: 'dd-smartscale', label: 'SmartScale', company: 'DoorDash', x: 50, y: 25, description: 'AI-powered order accuracy verification for merchants, operating with conditional autonomy.', controls: ['Accuracy threshold monitoring', 'Merchant dispute resolution path', 'Regular calibration audits'] },
  { id: 'dd-menuphotos', label: 'AI Menu Photos', company: 'DoorDash', x: 25, y: 20, description: 'Automated food photography generation for merchant listings with human review.', controls: ['IP filter compliance (LG02)', 'Brand asset accuracy (BR02)', 'Merchant approval workflow'] },
  { id: 'ub-gateway', label: 'GenAI Gateway', company: 'Uber Eats', x: 50, y: 70, description: 'Centralized AI gateway supporting 60+ use cases with unified logging and experimentation.', controls: ['Centralized logging and audit', 'Model access governance', 'Experimentation guardrails'] },
  { id: 'ub-dispatch', label: 'Cross-Network Dispatch', company: 'Uber Eats', x: 90, y: 80, description: 'Cross-dispatching drivers between mobility and delivery networks with autonomous labor allocation.', controls: ['Cross-pool earnings fairness', 'Driver classification safeguards', 'Anti-discrimination audits'] },
  { id: 'ic-ask', label: 'Ask Instacart', company: 'Instacart', x: 55, y: 50, description: 'NLP grocery discovery built on proprietary product graph with recipe and dietary constraint integration.', controls: ['Allergy/dietary accuracy (TS02)', 'Product graph verification', 'Merchant neutrality monitoring'] },
  { id: 'ic-operator', label: 'OpenAI Operator', company: 'Instacart', x: 60, y: 55, description: 'AI agent partnership enabling autonomous cart population and shopping list generation.', controls: ['Third-party model governance', 'Transaction authorization limits', 'User consent verification'] },
  { id: 'gh-nash', label: 'Nash AI Dispatch', company: 'Grubhub', x: 50, y: 55, description: 'Third-party dispatch optimization with conditional autonomy through Nash partnership.', controls: ['Partner SLA monitoring', 'Dispatch fairness audits', 'Governance responsibility mapping'] },
  { id: 'mt-dispatch', label: 'National Dispatch', company: 'Meituan', x: 95, y: 85, description: 'Billions of daily routing decisions with fully autonomous national-scale dispatch engine.', controls: ['National-scale fairness monitoring', 'Courier safety routing', 'Traffic integration verification', 'System-wide circuit breakers'] },
];

export const quadrantLabels = {
  topRight: { title: 'Critical Risk', subtitle: 'Mandatory Controls Required', description: 'High autonomy systems affecting many stakeholders. Require comprehensive governance: exec sign-off, full red-teaming, mandatory audit trails, kill-switch capability.' },
  topLeft: { title: 'Elevated Risk', subtitle: 'Enhanced Monitoring', description: 'Lower autonomy but high stakeholder impact. Require enhanced human oversight, escalation protocols, and regular fairness audits.' },
  bottomRight: { title: 'Operational Risk', subtitle: 'Standard Controls + Monitoring', description: 'High autonomy with limited stakeholder exposure. Require technical safeguards, automated monitoring, and periodic review.' },
  bottomLeft: { title: 'Standard Risk', subtitle: 'Baseline Governance', description: 'Low autonomy and limited exposure. Standard development practices, basic monitoring, and regular check-ins.' },
};

export interface LifecycleStage {
  id: number;
  title: string;
  shortTitle: string;
  purpose: string;
  deliverables: string[];
  mandatoryControls: Record<string, string[]>;
  failureModes: string[];
}

export const lifecycleStages: LifecycleStage[] = [
  {
    id: 1, title: 'Problem Selection', shortTitle: 'Select',
    purpose: 'Justify why an agentic solution is appropriate instead of deterministic automation. Evaluate impact, feasibility, and risk.',
    deliverables: ['Use-case justification document', 'Impact-feasibility-risk scoring', 'Stakeholder impact assessment', 'Regulatory exposure scan'],
    mandatoryControls: {
      'Assistive-Low': ['Standard use-case review', 'Team lead approval'],
      'Assistive-High': ['Enhanced impact assessment', 'Cross-functional review'],
      'Conditional-Low': ['Formal use-case document', 'Risk domain mapping'],
      'Conditional-High': ['Full stakeholder analysis', 'Legal pre-review', 'Exec notification'],
      'Autonomous-Low': ['Comprehensive justification', 'Ethics review'],
      'Autonomous-High': ['Board-level justification', 'Full regulatory scan', 'Exec + Legal approval'],
    },
    failureModes: ['Deploying agentic AI where deterministic rules suffice', 'Underestimating stakeholder exposure', 'Skipping regulatory pre-screening for speed'],
  },
  {
    id: 2, title: 'Agent Specification', shortTitle: 'Specify',
    purpose: 'Formalize optimization objectives, data boundaries, permitted actions, and escalation thresholds before coding begins.',
    deliverables: ['Written agent specification', 'Objective hierarchy document', 'Data access boundary map', 'Escalation trigger definitions', 'Success and fairness metrics'],
    mandatoryControls: {
      'Assistive-Low': ['Basic spec document', 'Single metric definition'],
      'Assistive-High': ['Detailed spec with fairness metrics', 'Stakeholder-specific constraints'],
      'Conditional-Low': ['Full spec with objective hierarchy', 'Data boundary map'],
      'Conditional-High': ['Full spec + legal review', 'Hard constraints defined', 'Monitoring metrics'],
      'Autonomous-Low': ['Comprehensive spec', 'Ethics review of objectives'],
      'Autonomous-High': ['Full spec with legal/ethics/exec review', 'Explicit constraint encoding', 'Fairness indicators mandatory'],
    },
    failureModes: ['Unclear or conflicting optimization goals', 'Unbounded data access', 'Missing escalation triggers for edge cases', 'Fairness metrics treated as optional'],
  },
  {
    id: 3, title: 'Workflow Design & Autonomy Tiering', shortTitle: 'Design',
    purpose: 'Assign autonomy tier, define human-in-the-loop requirements, and design escalation triggers tied to measurable conditions.',
    deliverables: ['Autonomy tier assignment', 'HITL requirements specification', 'Escalation trigger matrix', 'Financial threshold definitions', 'Rollback procedure document'],
    mandatoryControls: {
      'Assistive-Low': ['Standard HITL design', 'Basic escalation rules'],
      'Assistive-High': ['Enhanced HITL with stakeholder-specific paths', 'Subgroup monitoring'],
      'Conditional-Low': ['Formal HITL with approval workflows', 'Financial thresholds'],
      'Conditional-High': ['Comprehensive HITL', 'Mandatory financial caps', 'Confidence-based routing', 'Safety overrides'],
      'Autonomous-Low': ['Minimal HITL with circuit breakers', 'Automated escalation'],
      'Autonomous-High': ['Comprehensive autonomy constraints', 'Mandatory kill-switch', 'Real-time confidence routing', 'Multi-stakeholder escalation paths'],
    },
    failureModes: ['Autonomy tier assigned too low for actual system capability', 'HITL requirements assumed but not enforced', 'Escalation triggers too broad or too narrow'],
  },
  {
    id: 4, title: 'Testing & Red-Teaming', shortTitle: 'Test',
    purpose: 'Stress-test agents against adversarial personas and structured attack taxonomies before scale exposure.',
    deliverables: ['Red-team test results', 'Severity-graded vulnerability report', 'Exploit success rate metrics', 'Mitigation recommendations', 'Prompt injection resistance scores'],
    mandatoryControls: {
      'Assistive-Low': ['Basic functional testing', 'Standard QA'],
      'Assistive-High': ['Scenario-based testing', 'Stakeholder impact simulation'],
      'Conditional-Low': ['Structured red-teaming', 'Financial exploitation tests'],
      'Conditional-High': ['Full red-team suite', 'Adversarial persona testing', 'Regulatory boundary testing', 'Crisis-mode sensitivity testing'],
      'Autonomous-Low': ['Comprehensive adversarial testing', 'Prompt injection resistance'],
      'Autonomous-High': ['Full red-team + external audit', 'All attack taxonomy categories', 'Cascade failure simulation', 'Multi-agent interaction testing', '<5% jailbreak success rate (TS03)'],
    },
    failureModes: ['Testing only happy-path scenarios', 'Skipping prompt injection tests', 'Not testing multi-agent cascade failures', 'Insufficient adversarial persona coverage'],
  },
  {
    id: 5, title: 'Pilot Deployment', shortTitle: 'Pilot',
    purpose: 'Deploy with limited scope, defined guardrails, and predefined kill-switch criteria.',
    deliverables: ['Pilot deployment plan', 'Geographic/cohort restrictions', 'Kill-switch criteria', 'Monitoring dashboard', 'Incident response playbook'],
    mandatoryControls: {
      'Assistive-Low': ['Standard pilot parameters', 'Basic monitoring'],
      'Assistive-High': ['Restricted cohorts', 'Enhanced monitoring', 'Subgroup disparity tracking'],
      'Conditional-Low': ['Draft-only execution initially', 'Financial limits', 'Automated alerts'],
      'Conditional-High': ['Restricted geography', 'Low traffic %', 'Real-time monitoring', 'Daily review cadence'],
      'Autonomous-Low': ['Strict geographic limits', 'Kill-switch ready', 'Incident response team'],
      'Autonomous-High': ['Minimum viable deployment', 'Executive kill-switch', 'Real-time fairness monitoring', 'Predefined rollback triggers', 'Incident response <15 min'],
    },
    failureModes: ['Pilot scope creep without governance re-review', 'Kill-switch criteria undefined or untested', 'Monitoring gaps for subgroup impacts'],
  },
  {
    id: 6, title: 'Scaling & Autonomy Expansion', shortTitle: 'Scale',
    purpose: 'Scale as a governed decision requiring demonstrated stability, fairness, auditability, and rollback capability.',
    deliverables: ['Scaling approval document', 'Stability metrics report', 'Fairness audit results', 'Audit log verification', 'Rollback test results'],
    mandatoryControls: {
      'Assistive-Low': ['Standard scaling approval', 'Regular check-ins'],
      'Assistive-High': ['Demonstrated stability', 'Fairness baseline established'],
      'Conditional-Low': ['Formal scaling review', 'No significant fairness deviations', 'Audit logs verified'],
      'Conditional-High': ['Cross-functional scaling approval', 'Full fairness audit', 'Immutable audit logs', 'Rollback tested'],
      'Autonomous-Low': ['Exec approval for scaling', 'Comprehensive stability proof', 'Rollback capability verified'],
      'Autonomous-High': ['Board-level scaling approval', 'Zero significant fairness deviations', 'Full audit log availability (RG02)', 'Verified system rollback', 'Continuous monitoring infrastructure'],
    },
    failureModes: ['Gradual autonomy creep without re-review', 'Scaling without fairness re-evaluation', 'Audit trail gaps at scale', 'Rollback capability degraded by scaling changes'],
  },
];

export interface Gate {
  id: string;
  label: string;
  meaning: string;
  criteria: Record<string, string[]>;
  signOffs: Record<string, string[]>;
  evidence: string[];
}

export const gates: Gate[] = [
  {
    id: 'G1', label: 'Gate 1', meaning: 'Use-case approved for agentic approach',
    criteria: {
      'Assistive-Low': ['Team lead sign-off', 'Basic risk score < threshold'],
      'Assistive-High': ['Cross-functional review passed', 'Stakeholder impact assessed'],
      'Conditional-Low': ['Risk domain mapping complete', 'Regulatory scan clear'],
      'Conditional-High': ['Legal pre-review passed', 'Executive notification confirmed'],
      'Autonomous-Low': ['Ethics review passed', 'Comprehensive justification accepted'],
      'Autonomous-High': ['Board-level approval', 'Full regulatory scan passed', 'Legal + Ethics sign-off'],
    },
    signOffs: {
      'Assistive-Low': ['Product Lead'],
      'Assistive-High': ['Product Lead', 'Trust & Safety'],
      'Conditional-Low': ['Product Lead', 'Engineering Lead'],
      'Conditional-High': ['Product Lead', 'Legal', 'Trust & Safety'],
      'Autonomous-Low': ['VP Product', 'Legal', 'Ethics'],
      'Autonomous-High': ['C-Suite', 'Legal', 'Ethics', 'Trust & Safety'],
    },
    evidence: ['Use-case justification document', 'Risk scoring sheet', 'Regulatory exposure scan results'],
  },
  {
    id: 'G2', label: 'Gate 2', meaning: 'Specification reviewed and alignment confirmed',
    criteria: {
      'Assistive-Low': ['Basic spec complete'],
      'Assistive-High': ['Spec with fairness metrics approved'],
      'Conditional-Low': ['Full spec reviewed by engineering'],
      'Conditional-High': ['Spec approved by legal and product', 'Hard constraints defined'],
      'Autonomous-Low': ['Comprehensive spec with ethics review'],
      'Autonomous-High': ['Full spec approved by legal, ethics, and exec', 'All five required elements present'],
    },
    signOffs: {
      'Assistive-Low': ['Engineering Lead'],
      'Assistive-High': ['Engineering Lead', 'Product Lead'],
      'Conditional-Low': ['Engineering Lead', 'Product Lead'],
      'Conditional-High': ['Engineering Lead', 'Product Lead', 'Legal'],
      'Autonomous-Low': ['VP Engineering', 'Legal', 'Ethics'],
      'Autonomous-High': ['VP Engineering', 'C-Suite', 'Legal', 'Ethics'],
    },
    evidence: ['Agent specification document', 'Objective hierarchy', 'Data boundary map', 'Escalation triggers'],
  },
  {
    id: 'G3', label: 'Gate 3', meaning: 'Autonomy tier assigned and approved',
    criteria: {
      'Assistive-Low': ['HITL confirmed', 'Basic escalation rules set'],
      'Assistive-High': ['Enhanced HITL approved', 'Subgroup monitoring planned'],
      'Conditional-Low': ['Formal HITL with workflows', 'Financial thresholds set'],
      'Conditional-High': ['Comprehensive HITL approved', 'Safety overrides tested'],
      'Autonomous-Low': ['Circuit breakers verified', 'Automated escalation tested'],
      'Autonomous-High': ['Kill-switch operational', 'All escalation paths tested', 'Multi-stakeholder routing verified'],
    },
    signOffs: {
      'Assistive-Low': ['Product Lead'],
      'Assistive-High': ['Product Lead', 'Trust & Safety'],
      'Conditional-Low': ['Product Lead', 'Engineering Lead'],
      'Conditional-High': ['VP Product', 'Legal', 'Trust & Safety'],
      'Autonomous-Low': ['VP Product', 'VP Engineering', 'Legal'],
      'Autonomous-High': ['C-Suite', 'Legal', 'Trust & Safety', 'Ethics'],
    },
    evidence: ['Autonomy tier assignment', 'HITL specification', 'Escalation trigger matrix', 'Rollback procedure'],
  },
  {
    id: 'G4', label: 'Gate 4', meaning: 'Red-team results within thresholds',
    criteria: {
      'Assistive-Low': ['Basic QA passed'],
      'Assistive-High': ['Scenario testing complete', 'No critical failures'],
      'Conditional-Low': ['Red-team pass', 'Financial exploit tests clear'],
      'Conditional-High': ['Full red-team suite passed', 'All severity thresholds met'],
      'Autonomous-Low': ['Comprehensive testing passed', '<5% prompt injection success'],
      'Autonomous-High': ['Full red-team + external audit passed', 'All attack categories tested', 'Cascade failure tests clear'],
    },
    signOffs: {
      'Assistive-Low': ['QA Lead'],
      'Assistive-High': ['QA Lead', 'Trust & Safety'],
      'Conditional-Low': ['QA Lead', 'Security Team'],
      'Conditional-High': ['VP Engineering', 'Security Team', 'Trust & Safety'],
      'Autonomous-Low': ['VP Engineering', 'CISO', 'Trust & Safety'],
      'Autonomous-High': ['C-Suite', 'CISO', 'External Auditor', 'Trust & Safety'],
    },
    evidence: ['Red-team report', 'Vulnerability log', 'Exploit success rates', 'Mitigation recommendations'],
  },
  {
    id: 'G5', label: 'Gate 5', meaning: 'Pilot metrics meet governance criteria',
    criteria: {
      'Assistive-Low': ['Pilot metrics within bounds'],
      'Assistive-High': ['No subgroup disparities detected', 'Monitoring metrics stable'],
      'Conditional-Low': ['Financial metrics within limits', 'No policy violations'],
      'Conditional-High': ['All governance metrics met', 'Zero critical incidents', 'Fairness metrics stable'],
      'Autonomous-Low': ['Full stability demonstrated', 'Rollback tested successfully'],
      'Autonomous-High': ['Zero critical incidents', 'Zero significant fairness deviations', 'Full audit log verified', 'Rollback capability confirmed', 'Scaling approval from governance board'],
    },
    signOffs: {
      'Assistive-Low': ['Product Lead'],
      'Assistive-High': ['Product Lead', 'Trust & Safety'],
      'Conditional-Low': ['VP Product', 'Engineering Lead'],
      'Conditional-High': ['VP Product', 'Legal', 'Trust & Safety', 'Finance'],
      'Autonomous-Low': ['VP Product', 'VP Engineering', 'Legal'],
      'Autonomous-High': ['C-Suite', 'Board Governance Committee', 'Legal', 'Trust & Safety', 'Ethics'],
    },
    evidence: ['Pilot metrics report', 'Incident log', 'Fairness audit', 'Audit trail verification', 'Rollback test results'],
  },
];

export const controlSwimlanes = [
  {
    id: 'build',
    label: 'Build Controls',
    subtitle: 'Design-time',
    stages: [
      'Spec writing, architecture review',
      'Objective hierarchy, data boundaries',
      'HITL encoding, constraint implementation',
      'Test plan creation, attack taxonomy',
      '',
      '',
    ],
  },
  {
    id: 'launch',
    label: 'Launch Controls',
    subtitle: 'Approval / Gates',
    stages: [
      'Use-case approval',
      'Spec sign-off',
      'Autonomy tier approval',
      'Red-team threshold pass',
      'Pilot authorization, kill-switch verification',
      'Scaling approval, autonomy expansion approval',
    ],
  },
  {
    id: 'run',
    label: 'Run Controls',
    subtitle: 'Monitoring / Incident Response',
    stages: [
      '',
      '',
      '',
      '',
      'Real-time monitoring, incident response, fairness tracking',
      'Continuous monitoring, audit trails, autonomy creep prevention',
    ],
  },
];

export function getAutoInsights(selectedCompanies: Company[], selectedDomains: Domain[]): string[] {
  const insights: string[] = [];
  if (selectedCompanies.length === 0 || selectedDomains.length === 0) return ['Select companies and domains to see insights.'];

  const scores = selectedCompanies.map(c => ({
    company: c,
    avg: selectedDomains.reduce((sum, d) => sum + capabilityScores[c][d], 0) / selectedDomains.length,
    max: Math.max(...selectedDomains.map(d => capabilityScores[c][d])),
    maxDomain: selectedDomains.reduce((best, d) => capabilityScores[c][d] > capabilityScores[c][best] ? d : best, selectedDomains[0]),
  }));

  const leader = scores.reduce((a, b) => a.avg > b.avg ? a : b);
  insights.push(`${leader.company} leads overall with an average capability score of ${leader.avg.toFixed(1)}/5 across selected domains.`);

  const laggard = scores.reduce((a, b) => a.avg < b.avg ? a : b);
  if (laggard.company !== leader.company) {
    insights.push(`${laggard.company} trails with ${laggard.avg.toFixed(1)}/5, presenting the largest capability gap (${(leader.avg - laggard.avg).toFixed(1)} points).`);
  }

  for (const domain of selectedDomains) {
    const domainLeader = selectedCompanies.reduce((a, b) => capabilityScores[a][domain] > capabilityScores[b][domain] ? a : b);
    const score = capabilityScores[domainLeader][domain];
    if (score >= 5) {
      insights.push(`${domainLeader} dominates ${domain} at level 5 -- this represents the highest governance exposure requiring comprehensive controls.`);
    }
  }

  if (selectedDomains.includes('Dispatch AI') && selectedDomains.includes('Support AI')) {
    insights.push('Dispatch + Support AI together create compound governance risk: failures in one cascade to the other, requiring coordinated oversight.');
  }

  if (selectedCompanies.includes('DoorDash')) {
    const ddAvg = selectedDomains.reduce((sum, d) => sum + capabilityScores.DoorDash[d], 0) / selectedDomains.length;
    if (ddAvg >= 4.5) {
      insights.push('DoorDash operates at maximum capability across these domains, underscoring the urgency of the governance playbook proposed in this analysis.');
    }
  }

  return insights.slice(0, 5);
}

export const STEPS = [
  { id: 0, title: 'Capability Comparison', subtitle: 'AI Strategic Profile & Maturity', icon: 'radar' },
  { id: 1, title: 'Technology Map', subtitle: 'Competitor Tech Stack Matrix', icon: 'grid' },
  { id: 2, title: 'Risk Quadrant', subtitle: 'Governance Risk Prioritization', icon: 'target' },
  { id: 3, title: 'Governance Playbook', subtitle: 'Stage-Gated Lifecycle Controls', icon: 'book' },
] as const;
