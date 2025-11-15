
export enum AppPhase {
    SETUP = 'Setup',
    FOUNDATIONS = 'Foundations',
    FEATURES = 'Features',
    LAUNCH = 'Launch',
}

export interface AppPlan {
    idea: string;
    ideaImprovements: string[];
    marketValidation: MarketValidation | null;
    persona: Persona | null;
    pricing: PricingTier[];
    techStack: TechStack | null;
    mvpPlan: MvpStep[];
    features: Feature[];
}

export interface MarketValidation {
    coreProblem: string;
    founderProfile: string;
    communityResearch: string[];
    competitors: string[];
    differentiation: string[];
    riskAssessment: string;
}

export interface Persona {
    name: string;
    demographics: string;
    psychographics: string;
    bio: string;
    goals: string[];
    painPoints: string[];
}

export interface PricingTier {
    name: string;
    price: string;
    features: string[];
}

export interface TechStack {
    category: string;
    backend: string;
    database: string;
    authentication: string;
    payments: string;
    services: string[];
}

export interface MvpStep {
    id: number;
    title: string;
    completed: boolean;
    prompt: Prompt | null;
}

export interface Feature {
    id: string;
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    category: string;
    prompt: Prompt | null;
}

export interface Prompt {
    context: string;
    userJourney: string;
    technology: string;
    design: string;
    negativePrompt?: string;
}

export const MVP_CHECKLIST_TEMPLATE: Omit<MvpStep, 'prompt'>[] = [
    { id: 1, title: 'Set up your app (Project initialization, basic structure)', completed: false },
    { id: 2, title: 'Add and test database', completed: false },
    { id: 3, title: 'Add and test authentication', completed: false },
    { id: 4, title: 'Add and test payments', completed: false },
    { id: 5, title: 'Build and test core features (e.g., first feature, brain dump, SMS reminders)', completed: false },
    { id: 6, title: 'Test and deploy your app', completed: false },
];
