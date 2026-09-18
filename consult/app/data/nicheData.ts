export type NicheId = 'tech_pro' | 'returning_mom' | 'customer_support';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  remoteRelevance: string;
  phase: 1 | 2 | 3; // Phase 1: Days 1-30, Phase 2: Days 31-60, Phase 3: Days 61-90
  pillar: 'linkedin' | 'async_interview' | 'job_funnel';
  priority: 'Critical' | 'High' | 'Standard';
  estimatedHours: string;
}

export interface PhaseMilestone {
  phase: 1 | 2 | 3;
  name: string;
  dayRange: string;
  pillar: string;
  theme: string;
  coreDeliverable: string;
  deliverableTarget: string;
  remoteFocus: string;
  keyOutputs: string[];
}

export interface LinkedInScorecardData {
  initialScore: number;
  targetScore: number;
  beforeHeadline: string;
  afterHeadline: string;
  beforeSummary: string;
  afterSummary: string;
  atsKeywords: string[];
  keyImprovements: string[];
}

export interface AsyncInterviewPrompt {
  id: string;
  promptQuestion: string;
  contextScenario: string;
  format: '60s Video Pitch' | 'Written Async Triage' | 'System Walkthrough';
  evaluationRubric: {
    criterion: string;
    description: string;
    points: number;
  }[];
  sampleGoodResponseGuide: string;
}

export interface JobFunnelConfig {
  targetDays: number;
  targetApplications: number;
  targetScreenings: number;
  targetTrials: number;
  targetOffers: number;
  primaryJobBoards: string[];
  timezoneStrategy: string;
  asyncCompanyHighlights: string[];
}

export interface NicheProfile {
  id: NicheId;
  name: string;
  shortTag: string;
  badge: string;
  avatarIcon: string;
  targetAudience: string;
  corePainPoint: string;
  heroHeadline: string;
  heroSubtitle: string;
  remoteOutcomeTarget: string;
  vocabularyTerms: { term: string; definition: string }[];
  milestones: PhaseMilestone[];
  checklist: ChecklistItem[];
  linkedInScorecard: LinkedInScorecardData;
  asyncInterview: AsyncInterviewPrompt;
  jobFunnel: JobFunnelConfig;
}

export const NICHES_DATA: Record<NicheId, NicheProfile> = {
  tech_pro: {
    id: 'tech_pro',
    name: 'Tech Professionals',
    shortTag: 'Tech Pro',
    badge: 'Engineers & Product Leads',
    avatarIcon: 'code',
    targetAudience: 'Software engineers, data analysts, product managers, DevOps architects.',
    corePainPoint: 'Tech-stack signaling, bypassing automated ATS screeners, and securing high-compensation global asynchronous remote companies.',
    heroHeadline: 'High-Signal Remote Tech Career Transformation',
    heroSubtitle: 'Transform your GitHub, LinkedIn, and asynchronous code review signaling to land top-tier global remote engineering positions.',
    remoteOutcomeTarget: 'Secure a top-quartile global asynchronous remote tech offer ($120k–$210k+ USD) within 90 days.',
    vocabularyTerms: [
      { term: 'Async Pull Request', definition: 'Communicating architectural tradeoffs clearly in written markdown rather than synchronously.' },
      { term: 'Timezone Overlap', definition: 'Targeting minimum 3–4 hours of team operational overlap (e.g. UTC-5 to UTC+1).' },
      { term: 'ATS Keyword Density', definition: 'Matching specific stack identifiers (e.g., Next.js, Distributed K/V, Docker, Kafka) to screener filters.' },
      { term: 'Loom Architecture Pitch', definition: 'A 90-second asynchronous video walk-through demonstrating technical decision-making.' },
    ],
    milestones: [
      {
        phase: 1,
        name: 'Phase 1: Foundation & Digital Positioning',
        dayRange: 'Days 1–30',
        pillar: 'Pillar 1: LinkedIn & Profile Optimization',
        theme: 'ATS Tech-Stack Signaling & Global Resume Refactor',
        coreDeliverable: 'ATS-Optimized LinkedIn Profile Score 92+ & Single-Page Markdown Tech Resume',
        deliverableTarget: 'Profile indexed by global remote tech recruiters within 30 days',
        remoteFocus: 'Ensuring your GitHub repo pins and LinkedIn headline immediately signal asynchronous system reliability and global timezone readiness.',
        keyOutputs: [
          'Rewritten headline highlighting primary stack + timezone band (e.g., UTC-5 to UTC+2)',
          'Top 3 GitHub repositories audited with production-grade README architecture diagrams',
          'Single-page functional tech resume stripped of local office fluff, tuned for Lever/Greenhouse ATS',
        ],
      },
      {
        phase: 2,
        name: 'Phase 2: Asynchronous Execution & Interview Trials',
        dayRange: 'Days 31–60',
        pillar: 'Pillar 2: Asynchronous Interviewing Mastery',
        theme: 'Video Code Walkthroughs & Written Take-Home Polish',
        coreDeliverable: 'Validated 3-Minute Loom System Walkthrough & Take-Home Framework Library',
        deliverableTarget: 'Achieve 100% pass rate on take-home and asynchronous video screening stages',
        remoteFocus: 'Remote teams evaluate how you write technical documentation and explain architecture without interrupting colleagues with calls.',
        keyOutputs: [
          'Pre-recorded 90-second technical intro video tailored for asynchronous screening',
          'Reusable take-home test template featuring unit tests, Docker setup, and benchmark docs',
          'Passing score on the asynchronous architecture trade-off mock prompt',
        ],
      },
      {
        phase: 3,
        name: 'Phase 3: Scaling the Remote Funnel & Offer Closing',
        dayRange: 'Days 61–90',
        pillar: 'Pillar 3: Job Application Funnel Tracking',
        theme: 'Distributed Company Funnel & Global Compensation Negotiation',
        coreDeliverable: 'Target 50+ High-Fit Asynchronous Applications -> 1–3 Validated Global Remote Offers',
        deliverableTarget: 'Signed remote offer letter within 90 days with clear asynchronous working agreements',
        remoteFocus: 'Bypassing generic job boards; utilizing targeted remote-first repositories, reverse-pitching engineering managers on LinkedIn.',
        keyOutputs: [
          '50 targeted applications submitted to verified distributed-first tech companies',
          'Pipeline tracking: minimum 10 recruiter screenings and 4 technical take-home trials',
          'Global remote contract negotiation playbook (EOE vs. B2B, equipment stipends, equity)',
        ],
      },
    ],
    checklist: [
      {
        id: 'tech_chk_1',
        title: 'Audit GitHub Profile Link & Pinned Repositories',
        description: 'Ensure top 3 pinned repositories have animated GIF demos, architecture schemas, and clean setup scripts.',
        remoteRelevance: 'Distributed tech hiring managers assess your code documentation before scheduling a synchronous interview.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '3h',
      },
      {
        id: 'tech_chk_2',
        title: 'Optimize LinkedIn Skills & Headline for ATS Screeners',
        description: 'Include exact framework names, distributed systems tags, and your timezone window (e.g. "UTC-4 to UTC+2").',
        remoteRelevance: 'Automated remote recruiter scrapers filter tech talent by specific tech stacks and timezone overlap.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '2h',
      },
      {
        id: 'tech_chk_3',
        title: 'Filter Job Boards by Timezone Overlap Requirements',
        description: 'Identify companies requiring 4 hours of overlap with your geography on Wellfound, RemoteOK, and Himalayas.',
        remoteRelevance: 'Applying outside workable timezone overlap causes 80%+ of silent resume rejections in remote engineering.',
        phase: 1,
        pillar: 'job_funnel',
        priority: 'High',
        estimatedHours: '2.5h',
      },
      {
        id: 'tech_chk_4',
        title: 'Draft Asynchronous Architecture Trade-off Pitch',
        description: 'Document a 1-page case study: "How I redesigned our data pipeline asynchronously without synchronous meetings."',
        remoteRelevance: 'Demonstrates deep autonomy and high written EQ, the #1 trait remote tech companies seek.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'High',
        estimatedHours: '4h',
      },
      {
        id: 'tech_chk_5',
        title: 'Record 90-Second Loom Code Walkthrough Video',
        description: 'Record a crisp, professional screen-share explaining a complex function or pull request in under 90 seconds.',
        remoteRelevance: 'Used as an unsolicited video attachment in application notes, boosting response rates by 3.5x.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'Critical',
        estimatedHours: '2h',
      },
      {
        id: 'tech_chk_6',
        title: 'Benchmark Global Salary Expectations (Levels.fyi & Wellfound)',
        description: 'Determine competitive remote compensation benchmarks accounting for location-agnostic vs. tiered pay.',
        remoteRelevance: 'Avoids pricing yourself out while ensuring you don’t accept under-market local rates for global output.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'High',
        estimatedHours: '1.5h',
      },
      {
        id: 'tech_chk_7',
        title: 'Submit 25 Targeted Direct Applications to Async-First Startups',
        description: 'Direct outreach to Engineering Managers at GitLab, Automattic, Buffer, Zapier, and YC remote companies.',
        remoteRelevance: 'Direct outbound to remote engineering leaders converts at 14% vs. 1.5% on mass aggregators.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'Critical',
        estimatedHours: '6h',
      },
    ],
    linkedInScorecard: {
      initialScore: 44,
      targetScore: 95,
      beforeHeadline: 'Software Engineer at Acme Corp | Building web applications',
      afterHeadline: 'Senior Full-Stack Engineer | Distributed Systems, React & Node.js | Asynchronous PR Specialist (UTC-5 to UTC+2)',
      beforeSummary: 'Experienced software developer with 4 years in software development looking for remote opportunities.',
      afterSummary: 'Senior Software Engineer with 5+ years specializing in distributed systems and asynchronous engineering workflows. Led migration of microservices handling 2.4M requests/day across 6 timezones. Proven track record of high-velocity documentation-first engineering and 98% on-time sprint deliveries without synchronous standup dependency.',
      atsKeywords: ['Distributed Systems', 'Next.js', 'PostgreSQL', 'Docker', 'Asynchronous Communication', 'CI/CD Pipelines', 'System Architecture', 'Timezone Overlap'],
      keyImprovements: [
        'Explicit timezone overlap window prominently displayed for global recruiter screeners',
        'Specific quantifiable performance metrics (2.4M req/day, 98% delivery) replacing vague descriptions',
        'Direct link to audited GitHub portfolio with production-ready architecture blueprints',
        'Elimination of generic buzzwords in favor of concrete modern tech stack tags',
      ],
    },
    asyncInterview: {
      id: 'tech_async_01',
      promptQuestion: 'Explain your strategy for resolving a breaking production bug when your team is 8 hours ahead and currently offline.',
      contextScenario: 'You are working asynchronously on a distributed team. At 4:00 PM in your timezone, a regression causes intermittent 502 errors in checkout. The primary code owner is asleep.',
      format: '60s Video Pitch',
      evaluationRubric: [
        { criterion: 'Diagnostic Independence', description: 'Checks logs, telemetry, and rollback criteria without panicking or waiting for ping.', points: 30 },
        { criterion: 'Clear Asynchronous Documentation', description: 'Leaves a structured incident summary thread with screenshots, repro steps, and git revert hash.', points: 40 },
        { criterion: 'Risk Mitigation', description: 'Safely toggles feature flags or initiates canary rollback rather than risky hot-fixing in isolation.', points: 30 },
      ],
      sampleGoodResponseGuide: 'Start by stating your protocol: 1. Confirm severity via Datadog/Sentry; 2. Mitigate user impact via rollback or feature flag disable; 3. Document findings with full telemetry links in the async incident channel so the team wakes up to a resolved state and clear post-mortem draft.',
    },
    jobFunnel: {
      targetDays: 90,
      targetApplications: 60,
      targetScreenings: 15,
      targetTrials: 6,
      targetOffers: 2,
      primaryJobBoards: ['Himalayas.app', 'Wellfound Remote', 'RemoteOK', 'Y Combinator Jobs', 'Remotive Tech'],
      timezoneStrategy: 'Target roles specifying +/- 4 hours of your primary timezone; specify explicit daily overlap hours in your initial pitch note.',
      asyncCompanyHighlights: ['GitLab', 'Automattic', 'Zapier', 'Doist', 'Buffer', 'Basecamp (37signals)', 'Supabase'],
    },
  },

  returning_mom: {
    id: 'returning_mom',
    name: 'Moms Returning to Work',
    shortTag: 'Returning Mom',
    badge: 'Flexible & Async Roles',
    avatarIcon: 'family_restroom',
    targetAudience: 'Mothers re-entering the corporate workforce after a 1–5+ year career pause, seeking flexible, asynchronous remote roles.',
    corePainPoint: 'Confidently reframing multi-year employment gaps, finding family-first distributed cultures, and avoiding micromanaged hourly check-in roles in favor of autonomous output.',
    heroHeadline: 'High-Value Career Return: Autonomous Remote Roles',
    heroSubtitle: 'Reframe your experience using modern functional positioning. Land high-trust, asynchronous remote roles that respect your time and family schedule.',
    remoteOutcomeTarget: 'Secure a flexible, asynchronous remote role ($65k–$110k+ USD) with guaranteed flexible core hours within 90 days.',
    vocabularyTerms: [
      { term: 'Functional Resume Layout', definition: 'Organizing your profile by high-impact capability clusters rather than linear chronological gap dates.' },
      { term: 'Asynchronous Core Hours', definition: 'Roles where performance is judged by completed deliverables rather than active green Slack bubbles.' },
      { term: 'Career Pause Reframe', definition: 'A concise 2-sentence positioning statement treating family leave as deliberate project leadership.' },
      { term: 'Family-First Distributed Culture', definition: 'Remote employers offering transparent async documentation, mental health stipends, and flexible PTO.' },
    ],
    milestones: [
      {
        phase: 1,
        name: 'Phase 1: Foundation & The Gap Reframe',
        dayRange: 'Days 1–30',
        pillar: 'Pillar 1: LinkedIn & Profile Optimization',
        theme: 'Functional Skill Framing & Confidence Scorecard',
        coreDeliverable: 'Refactored Functional Resume & 90+ Score LinkedIn Profile with Confident Pause Narrative',
        deliverableTarget: 'Profile optimized to highlight transferable leadership, operations, and stakeholder skills',
        remoteFocus: 'Framing your career pause transparently as intentional family leave while emphasizing modern digital literacy and high personal autonomy.',
        keyOutputs: [
          'Rewritten 2-sentence confident explanation for the employment gap on LinkedIn and CV',
          'Functional resume restructuring past achievements into transferable remote leadership modules',
          'Home office distraction-free remote baseline setup (lighting, microphone, dedicated workspace)',
        ],
      },
      {
        phase: 2,
        name: 'Phase 2: Asynchronous Video & Stakeholder Mastery',
        dayRange: 'Days 31–60',
        pillar: 'Pillar 2: Asynchronous Interviewing Mastery',
        theme: 'Async Video Pitches & Autonomy Proof Trials',
        coreDeliverable: 'Polished 2-Minute Asynchronous Video Intro & Scenario Response Portfolio',
        deliverableTarget: 'Demonstrate superior stakeholder empathy, boundary management, and task triage',
        remoteFocus: 'Proving you can manage complex deadlines without in-person supervision through clear written updates and crisp asynchronous video updates.',
        keyOutputs: [
          'Pre-recorded 2-minute video introduction conveying warmth, clarity, and remote project management readiness',
          'Scenario response to managing multiple competing priorities across distributed timezones',
          'Audit of remote tools: Slack etiquette, Notion project documentation, Google Workspace',
        ],
      },
      {
        phase: 3,
        name: 'Phase 3: The Family-First Remote Funnel',
        dayRange: 'Days 61–90',
        pillar: 'Pillar 3: Job Application Funnel Tracking',
        theme: 'Targeting Verified Distributed Companies & Offer Closing',
        coreDeliverable: '40+ Targeted Applications to Verified Async Employers -> 1+ Offer with Flexible Core Hours',
        deliverableTarget: 'Signed remote offer with explicitly validated asynchronous work policies',
        remoteFocus: 'Filtering out exploitative "camera-on 8 hours/day" monitoring roles; targeting companies evaluated for genuine async flexibility.',
        keyOutputs: [
          'Target list of 30 family-friendly distributed companies (e.g. Help Scout, Buffer, 37signals)',
          'Submitting tailored application pitches emphasizing proactive async documentation',
          'Interview negotiation questions verifying true async culture (no meeting Wednesdays, asynchronous retros)',
        ],
      },
    ],
    checklist: [
      {
        id: 'mom_chk_1',
        title: 'Format Resume Using Functional Skills Layout',
        description: 'Organize career history around Project Management, Stakeholder Communication, and Operational Strategy rather than strict chronological dates.',
        remoteRelevance: 'De-emphasizes linear time gaps and highlights capability to manage remote workflows independently.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '3h',
      },
      {
        id: 'mom_chk_2',
        title: 'Draft 2-Sentence Bulletproof Response for Employment Gap',
        description: 'Create a proud, succinct summary: "I took a planned career pause to lead family milestones, and I am now returning with focused autonomy and updated digital workflows."',
        remoteRelevance: 'Completely eliminates hesitation or awkwardness during asynchronous video screens and recruiter calls.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '1.5h',
      },
      {
        id: 'mom_chk_3',
        title: 'Filter Roles by "Asynchronous Focus" & Flexible Core Hours',
        description: 'Search remote listings using queries like "Async-first", "Result-Oriented Work Environment (ROWE)", "Flexible working hours".',
        remoteRelevance: 'Protects you from predatory hourly tracking software and rigid 9-to-5 camera mandates.',
        phase: 1,
        pillar: 'job_funnel',
        priority: 'High',
        estimatedHours: '2h',
      },
      {
        id: 'mom_chk_4',
        title: 'Set Up Ergonomic Home Office & Noise-Cancelling Audio Baseline',
        description: 'Configure Krisp.ai noise cancellation, ring lighting, and a clean background for high-confidence async video pitches.',
        remoteRelevance: 'Projects undeniable professional readiness and reliability for home-based corporate environments.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'High',
        estimatedHours: '2h',
      },
      {
        id: 'mom_chk_5',
        title: 'Record 2-Minute Asynchronous Video Introduction',
        description: 'Record an introductory clip focusing on self-management, proactive communication, and stakeholder management skills.',
        remoteRelevance: 'Bypasses initial resume screening bias by immediately showcasing poise, executive presence, and modern digital savvy.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'Critical',
        estimatedHours: '3h',
      },
      {
        id: 'mom_chk_6',
        title: 'Audit Target Employers for Certified Family-First Culture',
        description: 'Verify employee reviews on InHerSight, Glassdoor, and Key Values for asynchronous culture and caregiver support.',
        remoteRelevance: 'Ensures long-term career sustainability without burnout or conflicting family obligations.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'High',
        estimatedHours: '2.5h',
      },
      {
        id: 'mom_chk_7',
        title: 'Submit 35 High-Touch Outbound Applications with Intro Loom Note',
        description: 'Send custom applications with an embedded 60-second video message directly to People Operations leaders.',
        remoteRelevance: 'Increases interview callback rates by 400% for returning professionals.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'Critical',
        estimatedHours: '5h',
      },
    ],
    linkedInScorecard: {
      initialScore: 38,
      targetScore: 94,
      beforeHeadline: 'Former Project Coordinator | Taking time off for family | Open to opportunities',
      afterHeadline: 'Remote Operations & Project Manager | Asynchronous Workflows, Agile Delivery & Cross-Functional Team Leadership',
      beforeSummary: 'I have been out of the workforce for 3 years raising my children. Looking for a remote position with good work life balance.',
      afterSummary: 'Results-driven Project & Operations Specialist with 7+ years orchestrating complex cross-functional deliverables and digital operations. Known for exceptional asynchronous documentation, cross-team alignment, and zero-defect project tracking in fast-paced environments. Dedicated to output-driven, asynchronous remote teams where proactive communication and meticulous follow-through drive high business impact.',
      atsKeywords: ['Project Management', 'Asynchronous Operations', 'Cross-Functional Leadership', 'Agile Delivery', 'Notion', 'Slack Workflows', 'Stakeholder Management', 'Process Optimization'],
      keyImprovements: [
        'Removed defensive pause language; replaced with proactive, outcome-driven operational focus',
        'Added high-value digital remote collaboration keywords (Notion, Slack Workflows, Async Operations)',
        'Clear demonstration of autonomous project leadership that requires minimal oversight',
        'Professional, polished executive presence that commands respect from corporate hiring teams',
      ],
    },
    asyncInterview: {
      id: 'mom_async_01',
      promptQuestion: 'How do you structure your workday and keep stakeholders informed when working completely asynchronously across timezones?',
      contextScenario: 'Your manager is based in London (6 hours ahead) and your project counterparts are in San Francisco. You have minimal overlapping working hours.',
      format: '60s Video Pitch',
      evaluationRubric: [
        { criterion: 'Proactive Documentation', description: 'Emphasizes daily written end-of-day bulleted summaries and clear status updates.', points: 35 },
        { criterion: 'Boundary & Schedule Control', description: 'Explains clear dedicated focus blocks and transparent calendar availability.', points: 30 },
        { criterion: 'Autonomous Problem Solving', description: 'Mentions moving unblocked tasks forward while asynchronous input is pending.', points: 35 },
      ],
      sampleGoodResponseGuide: 'Highlight your daily rhythm: Start with an asynchronous morning scan of priority threads, complete high-leverage focus blocks during core hours, and leave a 3-bullet End-of-Day status update in the project channel detailing what was shipped, what is in progress, and any blocker requiring an overnight response.',
    },
    jobFunnel: {
      targetDays: 90,
      targetApplications: 45,
      targetScreenings: 12,
      targetTrials: 5,
      targetOffers: 2,
      primaryJobBoards: ['The Mom Project', 'InHerSight', 'FlexJobs Remote', 'Himalayas Async', 'We Work Remotely'],
      timezoneStrategy: 'Select companies advertising "Asynchronous-First" or "Flexible Hours"; confirm that team meetings do not exceed 3–5 hours per week.',
      asyncCompanyHighlights: ['Help Scout', 'Buffer', 'Automattic', 'Basecamp (37signals)', 'DuckDuckGo', 'Ghost Foundation', 'Doist'],
    },
  },

  customer_support: {
    id: 'customer_support',
    name: 'Customer Support Agents',
    shortTag: 'Customer Support',
    badge: 'SaaS Support & Success',
    avatarIcon: 'support_agent',
    targetAudience: 'Retail, hospitality workers, or entry-level reps transitioning to corporate remote helpdesk, SaaS tier-1 support, and customer success.',
    corePainPoint: 'Translating face-to-face service empathy into rapid digital ticketing workflows (Zendesk, Intercom), showcasing high-speed written communication, and passing async skills trials.',
    heroHeadline: 'Transition to High-Growth Corporate Remote Support',
    heroSubtitle: 'Turn your customer empathy into a lucrative remote SaaS career. Master Zendesk triage, professional typing speed, and asynchronous de-escalation.',
    remoteOutcomeTarget: 'Secure a corporate remote Support or Customer Success role ($55k–$85k+ USD) with equipment provided within 90 days.',
    vocabularyTerms: [
      { term: 'CSAT & First Contact Resolution', definition: 'Key performance metrics tracking customer satisfaction percentage and single-touch resolution.' },
      { term: 'Zendesk / Intercom Triage', definition: 'Tagging, routing, macro utilization, and SLA prioritization in modern remote helpdesk platforms.' },
      { term: 'WPM & Accuracy Benchmark', definition: 'Targeting 65–75+ words per minute with 98%+ accuracy for rapid remote ticket throughput.' },
      { term: 'Written De-escalation Protocol', definition: 'Diffusing tense client complaints using empathetic, legally sound written asynchronous phrasing.' },
    ],
    milestones: [
      {
        phase: 1,
        name: 'Phase 1: Digital Tool Stack & Tech Certification',
        dayRange: 'Days 1–30',
        pillar: 'Pillar 1: LinkedIn & Profile Optimization',
        theme: 'Zendesk Certification & High-Speed Written Proof',
        coreDeliverable: 'LinkedIn Profile Rebranded for Remote Tech Support + Verified Typing Certificate (65+ WPM)',
        deliverableTarget: 'Profile indexed for Tier-1/Tier-2 Technical Support & Customer Experience roles',
        remoteFocus: 'Translating hospitality/retail experience into corporate SaaS terminology (ticketing, SLA management, retention, escalation).',
        keyOutputs: [
          'Rewritten headline: "Remote Customer Support Specialist | Zendesk & Intercom Certified | 70 WPM"',
          'Free Zendesk / HubSpot Customer Service certification badge displayed on LinkedIn',
          'Verified typing speed screenshot certificate (minimum 65 WPM / 98% accuracy) embedded in featured section',
        ],
      },
      {
        phase: 2,
        name: 'Phase 2: Asynchronous De-escalation & Ticket Trials',
        dayRange: 'Days 31–60',
        pillar: 'Pillar 2: Asynchronous Interviewing Mastery',
        theme: 'Written Ticket Portfolio & Video Empathy Trials',
        coreDeliverable: 'Written Ticket Scenario Repository (5 Custom De-escalations) & 60-Second Video Pitch',
        deliverableTarget: 'Pass remote hiring manager written triage screening tests on first submission',
        remoteFocus: 'Remote support teams hire almost entirely based on your written tone, grammar precision, and speed under asynchronous test conditions.',
        keyOutputs: [
          'Written portfolio of 5 mock customer responses: billing dispute, product outage, feature request, angry refund, bug report',
          'Recorded 60-second video explaining why asynchronous support improves customer retention',
          'Mastery of keyboard shortcuts and macro authoring for modern helpdesk software',
        ],
      },
      {
        phase: 3,
        name: 'Phase 3: High-Velocity SaaS Application Funnel',
        dayRange: 'Days 61–90',
        pillar: 'Pillar 3: Job Application Funnel Tracking',
        theme: 'B2B SaaS Target List & Rapid Offer Acquisition',
        coreDeliverable: '60+ Direct Applications to Remote SaaS Helpdesks -> 2+ Final Round Trials & Signed Offer',
        deliverableTarget: 'Signed remote offer letter with company-provided hardware and remote stipend',
        remoteFocus: 'Targeting high-volume distributed SaaS companies where remote customer support is treated as a strategic growth engine.',
        keyOutputs: [
          '60 customized applications sent to B2B software companies on Wellfound and SupportDriven',
          'Completing paid 3-day async trial projects with top-quartile customer satisfaction scores',
          'Evaluating benefits: Remote equipment allowance ($1,000+), internet reimbursement, wellness perks',
        ],
      },
    ],
    checklist: [
      {
        id: 'cs_chk_1',
        title: 'List Proficiencies in Intercom, Zendesk & Ticketing Systems',
        description: 'Highlight familiarity with macros, ticket tagging, SLA monitoring, and multi-channel omnichannel queues on your profile.',
        remoteRelevance: 'Modern remote SaaS recruiters use automated search strings for "Zendesk" or "Intercom" to find qualified candidates.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '2h',
      },
      {
        id: 'cs_chk_2',
        title: 'Take & Record a Verified Professional Typing Speed Test',
        description: 'Complete a 5-minute verified test on TypingTest.com or Keybr (target: 65+ WPM with 98% accuracy) and save badge.',
        remoteRelevance: 'Direct proof that you can handle high-volume remote chat and ticket throughput without lag.',
        phase: 1,
        pillar: 'linkedin',
        priority: 'Critical',
        estimatedHours: '1h',
      },
      {
        id: 'cs_chk_3',
        title: 'Build Written Communication Samples Repository (5 Scenarios)',
        description: 'Write professional, empathetic responses to: 1. Billing dispute; 2. Outage update; 3. Feature request; 4. Hostile churn threat; 5. Bug report.',
        remoteRelevance: 'Used as an instant portfolio link in application cover letters, proving ready-to-deploy written customer empathy.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'Critical',
        estimatedHours: '4h',
      },
      {
        id: 'cs_chk_4',
        title: 'Prepare Asynchronous Video Answers to Difficult Customer Scenarios',
        description: 'Record video answer to: "How do you maintain empathy and de-escalate a customer who is furious about downtime?"',
        remoteRelevance: 'Demonstrates video presence for modern asynchronous video screeners like HireVue and Spark Hire.',
        phase: 2,
        pillar: 'async_interview',
        priority: 'High',
        estimatedHours: '2.5h',
      },
      {
        id: 'cs_chk_5',
        title: 'Join the SupportDriven Remote Community & Job Board',
        description: 'Create an account on the SupportDriven Slack and job board; introduce yourself in the #intros channel.',
        remoteRelevance: 'The largest specialized remote customer support community with 50+ unadvertised remote jobs weekly.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'High',
        estimatedHours: '1.5h',
      },
      {
        id: 'cs_chk_6',
        title: 'Target High-Growth B2B SaaS & Distributed Tech Companies',
        description: 'Filter for companies with 50–500 employees that prioritize high-touch technical customer onboarding and retention.',
        remoteRelevance: 'B2B SaaS support roles pay 40% higher than traditional retail call-center outsourcing contracts.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'Critical',
        estimatedHours: '3h',
      },
      {
        id: 'cs_chk_7',
        title: 'Submit 50 Targeted Remote Applications with Written Sample Link',
        description: 'Apply with customized cover letters linking directly to your written scenario portfolio and typing speed certificate.',
        remoteRelevance: 'Dramatically separates your application from hundreds of generic resumes lacking tangible work samples.',
        phase: 3,
        pillar: 'job_funnel',
        priority: 'Critical',
        estimatedHours: '6h',
      },
    ],
    linkedInScorecard: {
      initialScore: 41,
      targetScore: 96,
      beforeHeadline: 'Customer Service Representative at Retail Store | Hard worker looking for remote jobs',
      afterHeadline: 'Remote Customer Support & Success Specialist | Zendesk & Intercom Certified | 72 WPM | Tier-1 SaaS Triage & De-escalation',
      beforeSummary: 'Experienced retail customer service associate with strong interpersonal skills and phone etiquette. Looking to transition to an online remote role.',
      afterSummary: 'Customer Experience & Technical Support Specialist dedicated to rapid, empathetic resolution across omnichannel SaaS platforms. Certified in Zendesk Support and Intercom workflows with a verified 72 WPM typing speed. Proven ability to handle 60+ complex tickets daily while maintaining a 98% CSAT rating. Skilled in written de-escalation, SLA compliance, cross-functional bug reproduction, and asynchronous team communication.',
      atsKeywords: ['Zendesk Support', 'Intercom', 'Customer Success', 'CSAT Optimization', 'SLA Adherence', 'Written De-escalation', 'Technical Triage', 'Omnichannel Support'],
      keyImprovements: [
        'Transformed generic retail terminology into specialized corporate SaaS helpdesk metrics',
        'Featured verified typing speed (72 WPM) and Zendesk certification in the headline',
        'Highlighted quantitative daily ticket volume (60+ tickets/day) and customer satisfaction scores (98% CSAT)',
        'Signaled immediate capability to handle asynchronous text and chat queues with high polish',
      ],
    },
    asyncInterview: {
      id: 'cs_async_01',
      promptQuestion: 'An enterprise client writes an angry message stating that a critical bug caused them to lose an important client demo. Write the asynchronous response and record a 60-second Loom explanation.',
      contextScenario: 'The bug is currently known and being addressed by engineering with an estimated fix in 2 hours. The client is demanding immediate compensation and threatening cancellation.',
      format: 'Written Async Triage',
      evaluationRubric: [
        { criterion: 'Empathetic Non-Defensive Validation', description: 'Acknowledges emotional frustration and business impact without making premature legal promises.', points: 35 },
        { criterion: 'Clear Transparent Next Steps & SLA', description: 'States exact engineering status, realistic 2-hour timeline, and concrete commitment to update.', points: 35 },
        { criterion: 'Tone & De-escalation Quality', description: 'Maintains composure, professional warmth, and structured formatting.', points: 30 },
      ],
      sampleGoodResponseGuide: 'Acknowledge the high-stakes consequence immediately: "I completely understand how critical this demo was for your business, and I am deeply sorry this bug disrupted your presentation." Provide the concrete engineering status without jargon: "Our core engineering team is actively rolling out a fix, estimated within 90 minutes. I will personally monitor this ticket and provide an update at the top of the hour."',
    },
    jobFunnel: {
      targetDays: 90,
      targetApplications: 60,
      targetScreenings: 18,
      targetTrials: 7,
      targetOffers: 3,
      primaryJobBoards: ['SupportDriven Job Board', 'Himalayas Customer Support', 'Wellfound CS', 'We Work Remotely CS', 'Remote.co'],
      timezoneStrategy: 'Confirm shift coverage expectations (e.g. standard business hours vs. weekend rotation); ensure laptop & monitor allowance is included.',
      asyncCompanyHighlights: ['Zapier', 'Help Scout', 'Stripe Support', 'Linear', 'Loom', 'Notion Support', 'Automattic (Happiness Engineers)'],
    },
  },
};
