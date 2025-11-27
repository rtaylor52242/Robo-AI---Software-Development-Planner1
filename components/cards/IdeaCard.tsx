
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Modal from '../Modal';
import { AppPlan, AppPhase, PricingTier, TechStack, MVP_CHECKLIST_TEMPLATE, Persona, UserProfile } from '../../types';
import { generateIdeaImprovements, generateMarketValidation, generatePersona, generatePricing, generateTechStack, generateDesignDocument } from '../../services/geminiService';
import PersonaCard from './PersonaCard';

interface IdeaCardProps {
    plan: AppPlan;
    updatePlan: (updates: Partial<AppPlan>) => void;
    setCurrentPhase: (phase: AppPhase) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    userProfile: UserProfile;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ plan, updatePlan, setCurrentPhase, loading, setLoading, userProfile }) => {
    const [modal, setModal] = useState<string | null>(null);
    const [modalContent, setModalContent] = useState<any>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localIdea, setLocalIdea] = useState(plan.idea);
    const [localImprovements, setLocalImprovements] = useState(plan.ideaImprovements);

    useEffect(() => {
        setLocalIdea(plan.idea);
        setLocalImprovements(plan.ideaImprovements);
    }, [plan.idea, plan.ideaImprovements]);

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
    
    const handleGenerateDesignDoc = async () => {
        setLoading(true);
        try {
            const doc = await generateDesignDocument(plan);
            setModalContent(doc);
            setModal('designDoc');
        } catch(e) {
             console.error(e);
            alert(`Failed to generate Design Doc.`);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = () => {
        updatePlan({ idea: localIdea, ideaImprovements: localImprovements });
        setIsEditing(false);
    }

    const handleImprovementChange = (index: number, val: string) => {
        const newImprovements = [...localImprovements];
        newImprovements[index] = val;
        setLocalImprovements(newImprovements);
    }

    const ActionButton: React.FC<{ onClick: () => void; text: string; icon: string; disabled: boolean }> = ({ onClick, text, icon, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-2 text-left bg-gray-700/50 p-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            <i className={`fas ${icon}`}></i>
            <span>{text}</span>
            {loading && onClick.toString() === "pending" && <i className="fas fa-spinner fa-spin ml-auto"></i>}
        </button>
    );

    const headerActions = (
        <div className="flex items-center gap-2">
             <button onClick={() => setIsLocked(!isLocked)} className="text-gray-400 hover:text-white transition-colors" title={isLocked ? "Unlock to Edit" : "Lock"}>
                <i className={`fas ${isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
            </button>
             {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} disabled={isLocked} className="text-gray-400 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed" title="Edit">
                    <i className="fas fa-pencil-alt"></i>
                 </button>
            ) : (
                <>
                    <button onClick={handleSave} className="text-green-400 hover:text-green-300 transition-colors" title="Save"><i className="fas fa-save"></i></button>
                    <button onClick={() => { setIsEditing(false); setLocalIdea(plan.idea); setLocalImprovements(plan.ideaImprovements); }} className="text-red-400 hover:text-red-300 transition-colors" title="Cancel"><i className="fas fa-times"></i></button>
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
                        className="w-full p-2 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition h-24 mb-4"
                    />
                ) : (
                    <p className="mb-4">{plan.idea}</p>
                )}
                {plan.ideaImprovements.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Improvements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                            {isEditing ? 
                                localImprovements.map((imp, i) => (
                                    <li key={i} className="flex gap-2 mb-1">
                                        <input className="w-full bg-gray-700 rounded px-1" value={imp} onChange={e => handleImprovementChange(i, e.target.value)} />
                                    </li>
                                ))
                                : plan.ideaImprovements.map((imp, i) => <li key={i}>{imp}</li>)
                            }
                        </ul>
                    </div>
                )}
                <div className="space-y-2">
                    <ActionButton text="Improve Idea" icon="fa-wand-magic-sparkles" onClick={() => handleAction(() => generateIdeaImprovements(plan.idea), 'improvements')} disabled={plan.ideaImprovements.length > 0} />
                    <div className="flex gap-2">
                        <div className="flex-grow">
                             <ActionButton text="Market Validation" icon="fa-chart-line" onClick={() => handleAction(() => generateMarketValidation(plan), 'validation')} disabled={!plan.ideaImprovements.length || !!plan.marketValidation} />
                        </div>
                        {plan.marketValidation && (
                             <button onClick={() => { setModalContent(plan.marketValidation); setModal('validation'); }} className="bg-gray-700/50 p-3 rounded-lg hover:bg-indigo-600 transition text-gray-300 hover:text-white" title="View/Edit Validation">
                                <i className="fas fa-edit"></i>
                            </button>
                        )}
                    </div>
                    <ActionButton text="Add Persona" icon="fa-user-plus" onClick={() => handleAction(() => generatePersona(plan), 'persona')} disabled={!plan.marketValidation} />
                    <ActionButton text="Outline Pricing" icon="fa-dollar-sign" onClick={() => handleAction(() => generatePricing(plan), 'pricing')} disabled={!plan.personas.length || plan.pricing.length > 0} />
                    <ActionButton text="Recommend Tech Stack" icon="fa-cogs" onClick={() => handleAction(() => generateTechStack(plan, userProfile), 'tech')} disabled={plan.pricing.length === 0 || !!plan.techStack} />
                    <ActionButton text="Generate MVP Plan" icon="fa-tasks" onClick={handleGenerateMvpPlan} disabled={!plan.techStack || plan.mvpPlan.length > 0} />
                    <ActionButton text="Generate Design Doc & Prompt" icon="fa-file-code" onClick={handleGenerateDesignDoc} disabled={!plan.mvpPlan.length} />
                </div>
            </Card>

            <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'designDoc' ? 'App Design Document' : (modal === 'persona' ? 'New Persona' : (modal || ''))}>
                {modal === 'improvements' && <ImprovementsModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'validation' && <ValidationModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'persona' && <PersonaModalContent content={modalContent} updatePlan={updatePlan} plan={plan} onClose={() => setModal(null)} />}
                {modal === 'pricing' && <PricingModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'tech' && <TechStackModalContent content={modalContent} updatePlan={updatePlan} onClose={() => setModal(null)} />}
                {modal === 'designDoc' && <DesignDocModalContent content={modalContent} />}
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

const ValidationModalContent: React.FC<{ content: any, updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localContent, setLocalContent] = useState(content);

    const handleChange = (field: string, val: string) => {
        setLocalContent({...localContent, [field]: val});
    }

    const handleSave = () => {
        updatePlan({ marketValidation: localContent });
        setIsEditing(false);
        onClose();
    }
    
    // Simple helper for editable fields
    const Field = ({ label, field, isArray = false }: any) => (
        <div className="mb-2">
            <strong className="block text-indigo-300">{label}:</strong>
            {isEditing ? (
                 isArray ? (
                     <textarea className="w-full bg-gray-700 p-1 rounded" value={localContent[field].join('\n')} onChange={e => setLocalContent({...localContent, [field]: e.target.value.split('\n')})} rows={3} />
                 ) : (
                    <textarea className="w-full bg-gray-700 p-1 rounded" value={localContent[field]} onChange={e => handleChange(field, e.target.value)} rows={2} />
                 )
            ) : (
                 isArray ? <ul className="list-disc list-inside text-sm">{localContent[field].map((item:string, i:number) => <li key={i}>{item}</li>)}</ul> : <p className="text-sm">{localContent[field]}</p>
            )}
        </div>
    )

    return (
        <div className="space-y-2">
            <div className="flex justify-end mb-2">
                <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-indigo-400 hover:text-white">
                    {isEditing ? 'Stop Editing' : 'Edit Validation'}
                </button>
            </div>
            <Field label="Core Problem" field="coreProblem" />
            <Field label="Founder Profile" field="founderProfile" />
            <Field label="Community Research" field="communityResearch" isArray={true} />
            <Field label="Competitors" field="competitors" isArray={true} />
            <Field label="Differentiation" field="differentiation" isArray={true} />
            <Field label="Risk Assessment" field="riskAssessment" />
            
            <button onClick={handleSave} className="mt-4 bg-indigo-600 p-2 rounded w-full">Save & Close</button>
        </div>
    );
};

const PersonaModalContent: React.FC<{ content: Persona, updatePlan: (u: any) => void, plan: AppPlan, onClose: () => void }> = ({ content, updatePlan, plan, onClose }) => (
     <div className="space-y-4">
        <button onClick={() => { updatePlan({ personas: [...plan.personas, content] }); onClose(); }} className="bg-indigo-600 p-2 rounded w-full">Add Persona to Canvas</button>
        <PersonaCard persona={content} isPreview={true} />
    </div>
);

const PricingModalContent: React.FC<{ content: PricingTier[], updatePlan: (u: any) => void, onClose: () => void }> = ({ content, updatePlan, onClose }) => {
    const [tiers, setTiers] = useState(content);

    const handleFeatureChange = (tierIndex: number, featureIndex: number, val: string) => {
        const newTiers = [...tiers];
        newTiers[tierIndex].features[featureIndex] = val;
        setTiers(newTiers);
    };

    const addFeature = (tierIndex: number) => {
        const newTiers = [...tiers];
        newTiers[tierIndex].features.push("New Feature");
        setTiers(newTiers);
    };

    const removeFeature = (tierIndex: number, featureIndex: number) => {
        const newTiers = [...tiers];
        newTiers[tierIndex].features.splice(featureIndex, 1);
        setTiers(newTiers);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier, i) => (
                    <div key={i} className="bg-gray-700 p-4 rounded-lg flex flex-col h-full">
                        <input className="font-bold text-lg bg-transparent w-full mb-2 border-b border-transparent focus:border-indigo-500 focus:outline-none" value={tier.name} onChange={e => {
                            const newTiers = [...tiers];
                            newTiers[i].name = e.target.value;
                            setTiers(newTiers);
                        }} />
                        <input className="text-2xl font-bold bg-transparent w-full mb-2 border-b border-transparent focus:border-indigo-500 focus:outline-none" value={tier.price} onChange={e => {
                             const newTiers = [...tiers];
                             newTiers[i].price = e.target.value;
                             setTiers(newTiers);
                        }} />
                        <ul className="space-y-2 text-sm flex-grow">
                            {tier.features.map((feat, j) => (
                                <li key={j} className="flex gap-1 items-center">
                                    <input 
                                        className="bg-gray-800 rounded px-1 w-full text-xs py-1" 
                                        value={feat} 
                                        onChange={e => handleFeatureChange(i, j, e.target.value)} 
                                    />
                                    <button onClick={() => removeFeature(i, j)} className="text-red-400 hover:text-red-300"><i className="fas fa-times"></i></button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => addFeature(i)} className="mt-2 text-xs bg-gray-600 hover:bg-gray-500 py-1 rounded">+ Add Feature</button>
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
                <h4 className="font-bold text-lg text-indigo-300">Option #{i + 1}: {stack.category}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-300">
                    <p><strong>Backend:</strong> {stack.backend}</p>
                    <p><strong>Database:</strong> {stack.database}</p>
                    <p><strong>Auth:</strong> {stack.authentication}</p>
                    <p><strong>Payments:</strong> {stack.payments}</p>
                    <p><strong>Services:</strong> {stack.services.join(', ')}</p>
                </div>
            </div>
        ))}
    </div>
);

const DesignDocModalContent: React.FC<{ content: string }> = ({ content }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="relative">
            <button onClick={handleCopy} className="absolute top-0 right-0 bg-gray-700 hover:bg-indigo-600 px-3 py-1 rounded text-sm">
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-900 p-4 rounded overflow-auto max-h-[60vh]">
                {content}
            </div>
        </div>
    );
}

export default IdeaCard;
