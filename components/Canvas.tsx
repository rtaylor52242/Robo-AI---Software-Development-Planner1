
import React from 'react';
import { AppPlan, AppPhase, UserProfile } from '../types';
import IdeaCard from './cards/IdeaCard';
import PersonaCard from './cards/PersonaCard';
import TechStackCard from './cards/TechStackCard';
import MvpPlanCard from './cards/MvpPlanCard';
import FeatureCard from './cards/FeatureCard';
import UserProfileCard from './cards/UserProfileCard';

interface CanvasProps {
    plan: AppPlan;
    updatePlan: (updates: Partial<AppPlan>) => void;
    setCurrentPhase: (phase: AppPhase) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
}

const Canvas: React.FC<CanvasProps> = (props) => {
    return (
        <div className="space-y-8 pb-16">
            <h2 className="text-4xl font-bold text-center mb-4">
                My App: <span className="text-indigo-400">{props.plan.idea.length > 50 ? `${props.plan.idea.substring(0, 50)}...` : props.plan.idea}</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Column 1 */}
                <div className="lg:col-span-1 space-y-8">
                    <UserProfileCard userProfile={props.userProfile} setUserProfile={props.setUserProfile} />
                    <IdeaCard {...props} />
                    {props.plan.personas.map((persona, index) => (
                        <PersonaCard 
                            key={index} 
                            index={index}
                            persona={persona} 
                            onUpdate={(updated) => {
                                const newPersonas = [...props.plan.personas];
                                newPersonas[index] = updated;
                                props.updatePlan({ personas: newPersonas });
                            }}
                            onDelete={() => {
                                const newPersonas = props.plan.personas.filter((_, i) => i !== index);
                                props.updatePlan({ personas: newPersonas });
                            }}
                        />
                    ))}
                </div>

                {/* Column 2 */}
                <div className="lg:col-span-1 space-y-8">
                    {props.plan.techStack && <TechStackCard techStack={props.plan.techStack} updatePlan={props.updatePlan} />}
                    {props.plan.features.length > 0 && <FeatureCard {...props} />}
                </div>

                {/* Column 3 */}
                <div className="lg:col-span-1 space-y-8">
                   {props.plan.mvpPlan.length > 0 && <MvpPlanCard {...props} />}
                </div>
            </div>
        </div>
    );
};

export default Canvas;
