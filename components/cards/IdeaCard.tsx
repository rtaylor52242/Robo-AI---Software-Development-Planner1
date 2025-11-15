import React, { useState, useEffect } from 'react';
import Card from './Card';
import Modal from '../Modal';
import { AppPlan, AppPhase, PricingTier, TechStack, MVP_CHECKLIST_TEMPLATE, Persona } from '../../types';
import { generateIdeaImprovements, generateMarketValidation, generatePersona, generatePricing, generateTechStack } from '../../services/geminiService';
import PersonaCard from './PersonaCard';

interface IdeaCardProps {
    plan: AppPlan;
    updatePlan: (updates: Partial<AppPlan>) => void;
    setCurrentPhase: (phase: AppPhase) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ plan, updatePlan, setCurrentPhase, loading, setLoading }) => {
    const [modal, setModal] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<any>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localIdea, setLocalIdea] = useState(plan.idea);

    useEffect(() => {
        setLocalIdea(plan.idea);
    }, [plan.idea]);

    const handleAction = async (action: () => Promise<any>, modalKey: string) => {
        setLoading(true);
        try {
            const content = await action();
            setModalContent(content);
            setModal(modalKey);
        } catch (e) {
            console.error(e);
            alert(`Failed to generate ${modalKey}. Check console for details.`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGenerateMvpPlan = () => {
        updatePlan({ mvpPlan: MVP_CHECKLIST_TEMPLATE.map(step => ({...step, prompt: null})) });
        setCurrentPhase(AppPhase.FEATURES);
    }

    const handleSave = () => {
        updatePlan({ idea: localIdea });
        setIsEditing(false);
    }

    const ActionButton: React.FC<{ onClick: () => void; text: string; icon: string; disabled: boolean }> = ({ onClick, text, icon, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled || loading || isLocked}
            className="w-full flex items-center justify-center gap-2 text-left bg-gray-700/50 p-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            <i className={`fas ${icon}`}></i>
            <span>{text}</span>
            {loading && onClick.toString() === "pending" && <i className="fas fa-spinner fa-spin ml-auto"></i>}
        </button>
    );

    const headerActions = (
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className="text-gray-400 hover:text-white transition-colors">
                <i className={`fas ${isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
            </button>
             {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} disabled={isLocked} className="text-gray-400 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed">
                    <i className="fas fa-pencil-alt"></i>
                 </button>
            ) : (
                <>
                    <button onClick={handleSave} className="text-green-400 hover:text-green-300 transition-colors"><i className="fas fa-save"></i></button>
                    <button onClick={() => { setIsEditing(false); setLocalIdea(plan.idea); }} className="text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-times"></i></button>
                </>
            )}
        </div>
    );

    return (
        <>
            <Card title="Core Idea" icon="fa-lightbulb" headerActions={headerActions}>
                {isEditing ? (
                    <textarea 
                        value={localIdea}
                        onChange={(e) => setLocalIdea(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition h-24"
                    />
                ) : (
                    <p className="mb-4">{plan.idea}</p>
                )}
                {plan.ideaImprovements.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Improvements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                            {plan.ideaImprovements.map((imp, i) => <li key={i}>{imp}</li>)}
                        </ul>
                    </div>
                )}
                <div className="space-y-2">
                    <ActionButton text="Improve Idea" icon="fa-wand-magic-sparkles" onClick={() => handleAction(() => generateIdeaImprovements(plan.idea), 'improvements')} disabled={plan.ideaImprovements.length > 0} />
                    <ActionButton text="Market Validation" icon="fa-chart-line" onClick={() => handleAction(() => generateMarketValidation(plan), 'validation')} disabled={!plan.ideaImprovements.length || !!plan.marketValidation} />
                    <ActionButton text="Generate Persona" icon="fa-user" onClick={() => handleAction(() => generatePersona(plan), 'persona')} disabled={!plan.marketValidation || !!plan.persona} />
                    <ActionButton text="Outline Pricing" icon="fa-dollar-sign" onClick={() => handleAction(() => generatePricing(plan), 'pricing')} disabled={!plan.persona || plan.pricing.length > 0} />
                    <ActionButton text="Recommend Tech Stack" icon="fa-cogs" onClick={() => handleAction(() => generateTechStack(plan), 'tech')} disabled={plan.pricing.length === 0 || !!plan.techStack} />
                    <ActionButton text="Generate MVP Plan" icon="fa-tasks" onClick={handleGenerateMvpPlan} disabled={!plan.techStack || plan.mvpPlan.length > 0} />
                </div>
            </Card>

            <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal || ''}>
                {modal === 'improvements' && <ImprovementsModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'validation' && <ValidationModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'persona' && <PersonaModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'pricing' && <PricingModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'tech' && <TechStackModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
            </Modal>
        </>
    );
};

// Sub-components for modal content
const ImprovementsModalContent: React.FC<{ content: string[], updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => (
    <div>
        <ul className="space-y-2 list-disc list-inside">{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
        <button onClick={() => { updatePlan({ ideaImprovements: content }); onClose(); }} className="mt-4 bg-indigo-600 p-2 rounded w-full">Apply Improvements</button>
    </div>
);

const ValidationModalContent: React.FC<{ content: any, updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => (
    <div className="space-y-4">
        <div><strong>Core Problem:</strong> {content.coreProblem}</div>
        <div><strong>Founder Profile:</strong> {content.founderProfile}</div>
        <div><strong>Community Research:</strong> <ul className="list-disc list-inside">{content.communityResearch.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
        <button onClick={() => { updatePlan({ marketValidation: content }); onClose(); }} className="mt-4 bg-indigo-600 p-2 rounded w-full">Add to Canvas</button>
    </div>
);

const PersonaModalContent: React.FC<{ content: Persona, updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => (
     <div className="space-y-4">
        <button onClick={() => { updatePlan({ persona: content }); onClose(); }} className="bg-indigo-600 p-2 rounded w-full">Add Persona to Canvas</button>
        <PersonaCard persona={content} isPreview={true} />
    </div>
);

const PricingModalContent: React.FC<{ content: PricingTier[], updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => {
    const [tiers, setTiers] = useState(content);
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier, i) => (
                    <div key={i} className="bg-gray-700 p-4 rounded-lg">
                        <input className="font-bold text-lg bg-transparent w-full mb-2" value={tier.name} onChange={e => {
                            const newTiers = [...tiers];
                            newTiers[i].name = e.target.value;
                            setTiers(newTiers);
                        }} />
                        <input className="text-2xl font-bold bg-transparent w-full mb-2" value={tier.price} onChange={e => {
                             const newTiers = [...tiers];
                             newTiers[i].price = e.target.value;
                             setTiers(newTiers);
                        }} />
                        <ul className="list-disc list-inside space-y-1 text-sm">{tier.features.map((feat, j) => <li key={j}>{feat}</li>)}</ul>
                    </div>
                ))}
            </div>
            <button onClick={() => { updatePlan({ pricing: tiers }); onClose(); }} className="mt-4 bg-indigo-600 p-2 rounded w-full">Confirm Pricing</button>
        </div>
    );
};

const TechStackModalContent: React.FC<{ content: TechStack[], updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => (
    <div className="space-y-4">
        {content.map((stack, i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg hover:border-indigo-500 border border-transparent cursor-pointer" onClick={() => { updatePlan({ techStack: stack }); onClose(); }}>
                <h4 className="font-bold text-lg">{stack.category}</h4>
                <p><strong>Backend:</strong> {stack.backend}</p>
                <p><strong>Database:</strong> {stack.database}</p>
                <p><strong>Auth:</strong> {stack.authentication}</p>
                <p><strong>Payments:</strong> {stack.payments}</p>
                <p><strong>Services:</strong> {stack.services.join(', ')}</p>
            </div>
        ))}
    </div>
);


export default IdeaCard;