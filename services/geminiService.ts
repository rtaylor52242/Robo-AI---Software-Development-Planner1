
import { GoogleGenAI, Type } from "@google/genai";
import { AppPlan, MarketValidation, Persona, PricingTier, TechStack, Prompt, Feature } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const generateAndParseJson = async <T,>(prompt: string, schema: any): Promise<T> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const text = response.text.trim();
        return JSON.parse(text) as T;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get a valid JSON response from the AI model.");
    }
};

const buildContext = (plan: AppPlan): string => {
    let context = `
    Current App Plan Context:
    - Idea: ${plan.idea}
    - Improvements: ${plan.ideaImprovements.join(', ') || 'None'}
    `;
    if (plan.persona) {
        context += `- Persona: ${plan.persona.name}, ${plan.persona.bio}\n`;
    }
    if (plan.techStack) {
        context += `- Tech Stack: Backend: ${plan.techStack.backend}, DB: ${plan.techStack.database}\n`;
    }
    return context;
};

export const generateInitialIdeas = async (category: string): Promise<string[]> => {
    const prompt = `Generate 3 innovative and specific app ideas for the category "${category}". For example, if the category is 'fitness', suggest something like 'A fitness app for new parents that offers 15-minute, baby-friendly workouts'.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            ideas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ["ideas"],
    };
    const result = await generateAndParseJson<{ ideas: string[] }>(prompt, schema);
    return result.ideas;
};

export const generateIdeaImprovements = async (idea: string): Promise<string[]> => {
    const prompt = `Based on the app idea "${idea}", suggest one specific improvement for each of the following 5 areas:
    1. Target a more specific customer.
    2. Deliver a more specific outcome.
    3. Reduce the time to deliver the outcome.
    4. Increase the value of the outcome.
    5. Solve a more painful problem.
    Phrase each suggestion as a concise action item.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ["improvements"],
    };
    const result = await generateAndParseJson<{ improvements: string[] }>(prompt, schema);
    return result.improvements;
};

export const generateMarketValidation = async (plan: AppPlan): Promise<MarketValidation> => {
    const prompt = `Analyze the app idea: "${plan.idea}" with improvements: "${plan.ideaImprovements.join(', ')}". 
    Provide a market validation report covering:
    - The core problem being solved.
    - An ideal founder profile for this app.
    - 3 specific subreddits for community research.
    - A brief competitive landscape analysis.
    - Key differentiation opportunities.
    - A primary risk assessment.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            coreProblem: { type: Type.STRING },
            founderProfile: { type: Type.STRING },
            communityResearch: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            differentiation: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAssessment: { type: Type.STRING },
        },
        required: ["coreProblem", "founderProfile", "communityResearch", "competitors", "differentiation", "riskAssessment"],
    };
    return generateAndParseJson<MarketValidation>(prompt, schema);
};

export const generatePersona = async (plan: AppPlan): Promise<Persona> => {
    const prompt = `For the app idea "${plan.idea}" (improved with: ${plan.ideaImprovements.join(', ')}), create a detailed customer persona. Give them a name.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            demographics: { type: Type.STRING },
            psychographics: { type: Type.STRING },
            bio: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "demographics", "psychographics", "bio", "goals", "painPoints"],
    };
    return generateAndParseJson<Persona>(prompt, schema);
};

export const generatePricing = async (plan: AppPlan): Promise<PricingTier[]> => {
    const prompt = `Based on the app idea "${plan.idea}", suggest a 3-tier pricing model (e.g., Free, Pro, Annual Pro). For each tier, provide a name, price (e.g., '$0/mo', '$9/mo'), and a list of 3-4 key features.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "price", "features"],
        },
    };
    return generateAndParseJson<PricingTier[]>(prompt, schema);
};

export const generateTechStack = async (plan: AppPlan): Promise<TechStack[]> => {
    const prompt = `For the app idea "${plan.idea}", recommend 3 different tech stacks. Categorize them (e.g., "Best for simple web apps", "Best for full-stack web apps", "Best for complex mobile apps"). For each stack, specify the backend, database, authentication, payments (suggest Stripe or RevenueCat), and 2-3 relevant services/APIs.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                backend: { type: Type.STRING },
                database: { type: Type.STRING },
                authentication: { type: Type.STRING },
                payments: { type: Type.STRING },
                services: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["category", "backend", "database", "authentication", "payments", "services"],
        },
    };
    return generateAndParseJson<TechStack[]>(prompt, schema);
};

export const generateMvpStepPrompt = async (plan: AppPlan, stepTitle: string): Promise<Prompt> => {
    const context = buildContext(plan);
    const prompt = `
    ${context}
    
    Generate a 5-part prompt for an AI coding assistant to complete the following MVP step: "${stepTitle}".
    
    The prompt should include:
    1. Context: Why this step is crucial for the app.
    2. User Journey: What the user (or developer) does. If not user-facing, describe the technical outcome.
    3. Technology/Implementation Details: Referencing the tech stack.
    4. Design Direction: Suggest a simple, clean implementation.
    5. Negative Prompt: What not to change.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            context: { type: Type.STRING },
            userJourney: { type: Type.STRING },
            technology: { type: Type.STRING },
            design: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
        },
        required: ["context", "userJourney", "technology", "design", "negativePrompt"],
    };
    return generateAndParseJson<Prompt>(prompt, schema);
};

export const generateFeatureSuggestions = async (plan: AppPlan): Promise<Omit<Feature, 'id' | 'prompt'>[]> => {
    const context = buildContext(plan);
    const prompt = `
    ${context}
    
    Suggest 3 new features for this app. For each feature, provide a title, categorize it by impact (High, Medium, or Low), and give it a type (e.g., "Voice Task Prioritization", "Collaborative Sharing").
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                category: { type: Type.STRING },
            },
            required: ["title", "impact", "category"],
        },
    };
    return generateAndParseJson<Omit<Feature, 'id' | 'prompt'>[]>(prompt, schema);
};

export const generateFeaturePrompt = async (plan: AppPlan, feature: Feature): Promise<Prompt> => {
    const context = buildContext(plan);
    const prompt = `
    ${context}
    
    Generate a 5-part prompt for an AI coding assistant to build the feature: "${feature.title}".
    
    The prompt should include:
    1. Context: Why this feature is valuable to the user.
    2. User Journey: The precise steps the user takes to interact with it.
    3. Technology/Implementation Details: Referencing the tech stack.
    4. Design Direction: Keep it consistent with a minimal style.
    5. Negative Prompt: What not to change in the existing codebase.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            context: { type: Type.STRING },
            userJourney: { type: Type.STRING },
            technology: { type: Type.STRING },
            design: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
        },
        required: ["context", "userJourney", "technology", "design", "negativePrompt"],
    };
    return generateAndParseJson<Prompt>(prompt, schema);
};

export const generateInspirationInput = async (): Promise<{ idea: string; category: string }> => {
    const prompt = `Generate a random, creative, and innovative app idea. Provide a short description of the idea and a 1-2 word category it belongs to.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            idea: { type: Type.STRING, description: "A short description of the app idea (1 sentence)." },
            category: { type: Type.STRING, description: "A 1-2 word category." },
        },
        required: ["idea", "category"],
    };
    return generateAndParseJson<{ idea: string; category: string }>(prompt, schema);
};
