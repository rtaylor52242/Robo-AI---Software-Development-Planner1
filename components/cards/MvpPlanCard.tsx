
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Modal from '../Modal';
import { AppPlan, MvpStep, Prompt } from '../../types';
import { generateMvpStepPrompt } from '../../services/geminiService';

interface MvpPlanCardProps {
    plan: AppPlan;
    updatePlan: (updates: Partial<AppPlan>) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const MvpPlanCard: React.FC<MvpPlanCardProps> = ({ plan, updatePlan, loading, setLoading }) => {
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localMvpPlan, setLocalMvpPlan] = useState<MvpStep[]>(plan.mvpPlan);

    useEffect(() => {
        setLocalMvpPlan(plan.mvpPlan);
    }, [plan.mvpPlan]);

    const handleSave = () => {
        updatePlan({ mvpPlan: localMvpPlan });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setLocalMvpPlan(plan.mvpPlan);
        setIsEditing(false);
    };

    const handleTitleChange = (stepId: number, newTitle: string) => {
        const updatedPlan = localMvpPlan.map(step => 
            step.id === stepId ? { ...step, title: newTitle } : step
        );
        setLocalMvpPlan(updatedPlan);
    };

    const toggleStep = (stepId: number) => {
        if (isLocked) return;
        const newMvpPlan = plan.mvpPlan.map(step =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        updatePlan({ mvpPlan: newMvpPlan });
    };

    const handleGeneratePrompt = async (step: MvpStep, forceRegenerate = false) => {
        if (isLocked) return;
        if (step.prompt && !forceRegenerate) {
            setSelectedPrompt(step.prompt);
            return;
        }
        setLoading(true);
        try {
            const prompt = await generateMvpStepPrompt(plan, step.title);
            const newMvpPlan = plan.mvpPlan.map(s =>
                s.id === step.id ? { ...s, prompt } : s
            );
            updatePlan({ mvpPlan: newMvpPlan });
            setSelectedPrompt(prompt);
        } catch (e) {
            console.error(e);
            alert('Failed to generate prompt.');
        } finally {
            setLoading(false);
        }
    };

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
                    <button onClick={handleCancel} className="text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-times"></i></button>
                </>
            )}
        </div>
    );

    return (
        <>
            <Card title="MVP Plan" icon="fa-tasks" color="purple" headerActions={headerActions}>
                <ul className="space-y-3">
                    {(isEditing ? localMvpPlan : plan.mvpPlan).map((step, index) => (
                        <li key={step.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-grow mr-2">
                                <span className="text-gray-500 font-mono text-sm">{index + 1}.</span>
                                <input
                                    type="checkbox"
                                    checked={step.completed}
                                    onChange={() => toggleStep(step.id)}
                                    disabled={isLocked}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed flex-shrink-0"
                                />
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={step.title}
                                        onChange={(e) => handleTitleChange(step.id, e.target.value)}
                                        className="w-full text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                                    />
                                ) : (
                                    <span className={`flex-grow ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                        {step.title}
                                    </span>
                                )}
                            </div>
                             <div className="flex items-center gap-1 flex-shrink-0">
                                {step.prompt ? (
                                    <>
                                        <button onClick={() => handleGeneratePrompt(step)} disabled={isLocked} title="View Prompt" className="text-sm bg-gray-700 hover:bg-purple-600 h-8 w-8 flex items-center justify-center rounded-md transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button onClick={() => handleGeneratePrompt(step, true)} disabled={loading || isLocked} title="Regenerate Prompt" className="text-sm bg-gray-700 hover:bg-purple-600 h-8 w-8 flex items-center justify-center rounded-md transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                                            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                                        </button>
                                    </>
                                ) : (
                                     <button
                                        onClick={() => handleGeneratePrompt(step)}
                                        disabled={loading || isLocked}
                                        className="ml-2 text-sm bg-gray-700 hover:bg-purple-600 px-3 py-1 rounded-md transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-magic-sparkles mr-1"></i>
                                        Prompt
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>

            <Modal isOpen={!!selectedPrompt} onClose={() => setSelectedPrompt(null)} title="Generated Prompt">
                <PromptDisplay prompt={selectedPrompt} />
            </Modal>
        </>
    );
};

export const PromptDisplay: React.FC<{ prompt: Prompt | null }> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);
    if (!prompt) return null;

    const fullPromptText = `
Context: ${prompt.context}
User Journey: ${prompt.userJourney}
Technology: ${prompt.technology}
Design: ${prompt.design}
Negative Prompt: ${prompt.negativePrompt || 'None'}
    `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(fullPromptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4 text-sm bg-gray-900 p-4 rounded-lg relative">
             <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-indigo-600 p-2 rounded-md">
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i> {copied ? 'Copied!' : 'Copy'}
            </button>
            <div>
                <h4 className="font-bold text-indigo-400">1. Context</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{prompt.context}</p>
            </div>
            <div>
                <h4 className="font-bold text-indigo-400">2. User Journey</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{prompt.userJourney}</p>
            </div>
            <div>
                <h4 className="font-bold text-indigo-400">3. Technology/Implementation</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{prompt.technology}</p>
            </div>
            <div>
                <h4 className="font-bold text-indigo-400">4. Design Direction</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{prompt.design}</p>
            </div>
            {prompt.negativePrompt && <div>
                <h4 className="font-bold text-indigo-400">5. Negative Prompt</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{prompt.negativePrompt}</p>
            </div>}
        </div>
    );
};


export default MvpPlanCard;
