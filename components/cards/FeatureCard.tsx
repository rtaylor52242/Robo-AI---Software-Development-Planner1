import React, { useState, useEffect } from 'react';
import Card from './Card';
import Modal from '../Modal';
import { AppPlan, Feature, Prompt } from '../../types';
import { generateFeatureSuggestions, generateFeaturePrompt } from '../../services/geminiService';
import { PromptDisplay } from './MvpPlanCard';

interface FeatureCardProps {
    plan: AppPlan;
    updatePlan: (updates: Partial<AppPlan>) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ plan, updatePlan, loading, setLoading }) => {
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [customFeature, setCustomFeature] = useState('');
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localFeatures, setLocalFeatures] = useState<Feature[]>(plan.features);

    useEffect(() => {
        setLocalFeatures(plan.features);
    }, [plan.features]);

    const handleSave = () => {
        updatePlan({ features: localFeatures });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalFeatures(plan.features);
        setIsEditing(false);
    };

    const handleFeatureChange = (id: string, newTitle: string, newImpact: 'High' | 'Medium' | 'Low') => {
        setLocalFeatures(
            localFeatures.map(f => f.id === id ? {...f, title: newTitle, impact: newImpact} : f)
        );
    };

    const handleSuggestFeatures = async () => {
        setLoading(true);
        try {
            const suggestions = await generateFeatureSuggestions(plan);
            const newFeatures: Feature[] = suggestions.map(s => ({
                ...s,
                id: crypto.randomUUID(),
                prompt: null,
            }));
            updatePlan({ features: [...plan.features, ...newFeatures] });
        } catch (e) {
            console.error(e);
            alert('Failed to suggest features.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddCustomFeature = () => {
        if (!customFeature) return;
        const newFeature: Feature = {
            id: crypto.randomUUID(),
            title: customFeature,
            impact: 'Medium',
            category: 'Custom',
            prompt: null
        };
        updatePlan({ features: [...plan.features, newFeature] });
        setCustomFeature('');
    };

    const handleGeneratePrompt = async (feature: Feature) => {
        if(isLocked) return;
        if (feature.prompt) {
            setSelectedPrompt(feature.prompt);
            return;
        }
        setLoading(true);
        try {
            const prompt = await generateFeaturePrompt(plan, feature);
            const newFeatures = plan.features.map(f =>
                f.id === feature.id ? { ...f, prompt } : f
            );
            updatePlan({ features: newFeatures });
            setSelectedPrompt(prompt);
        } catch (e) {
            console.error(e);
            alert('Failed to generate prompt.');
        } finally {
            setLoading(false);
        }
    };
    
    const impactColor = {
        High: 'bg-red-500/50 text-red-300',
        Medium: 'bg-yellow-500/50 text-yellow-300',
        Low: 'bg-green-500/50 text-green-300',
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
            <Card title="Features" icon="fa-star" headerActions={headerActions}>
                <div className="space-y-3">
                    {(isEditing ? localFeatures : plan.features).map(feature => (
                        <div key={feature.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                            {isEditing ? (
                                <div className="flex-grow flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => handleFeatureChange(feature.id, e.target.value, feature.impact)}
                                        className="w-full text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                                    />
                                    <select 
                                        value={feature.impact} 
                                        onChange={(e) => handleFeatureChange(feature.id, feature.title, e.target.value as 'High' | 'Medium' | 'Low')}
                                        className="text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <p>{feature.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${impactColor[feature.impact]}`}>{feature.impact} Impact</span>
                                </div>
                            )}
                             <button
                                onClick={() => handleGeneratePrompt(feature)}
                                disabled={loading || isLocked}
                                className="ml-2 text-sm bg-gray-700 hover:bg-indigo-600 px-3 py-1 rounded-md transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <i className={`fas ${feature.prompt ? 'fa-eye' : 'fa-magic-sparkles'} mr-1`}></i>
                                {feature.prompt ? 'View' : 'Prompt'}
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <input type="text" value={customFeature} onChange={e => setCustomFeature(e.target.value)} placeholder="Add custom feature..." className="flex-grow p-2 bg-gray-700 rounded-md" disabled={isLocked}/>
                        <button onClick={handleAddCustomFeature} className="bg-gray-700 hover:bg-indigo-600 px-4 rounded-md" disabled={isLocked}>+</button>
                    </div>
                    <button onClick={handleSuggestFeatures} disabled={loading || isLocked} className="w-full bg-gray-700/50 p-2 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                       {loading ? 'Thinking...' : 'Suggest More Features'}
                    </button>
                </div>
            </Card>

            <Modal isOpen={!!selectedPrompt} onClose={() => setSelectedPrompt(null)} title="Feature Build Prompt">
                <PromptDisplay prompt={selectedPrompt} />
            </Modal>
        </>
    );
};

export default FeatureCard;