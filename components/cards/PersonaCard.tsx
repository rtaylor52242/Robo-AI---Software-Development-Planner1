import React, { useState, useEffect } from 'react';
import Card from './Card';
import { AppPlan, Persona } from '../../types';

interface PersonaCardProps {
    persona: Persona;
    isPreview?: boolean;
    updatePlan?: (updates: Partial<AppPlan>) => void;
}

const EditInput: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ value, onChange }) => (
    <input type="text" value={value} onChange={onChange} className="w-full text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition" />
);

const EditArea: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ value, onChange }) => (
    <textarea value={value} onChange={onChange} rows={3} className="w-full text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition" />
);

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isPreview = false, updatePlan }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localPersona, setLocalPersona] = useState(persona);

    useEffect(() => {
        setLocalPersona(persona);
    }, [persona]);
    
    const handleSave = () => {
        if(updatePlan) {
            updatePlan({ persona: localPersona });
        }
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setLocalPersona(persona);
        setIsEditing(false);
    };
    
    const handleChange = (field: keyof Persona, value: string) => {
        setLocalPersona(prev => ({ ...prev!, [field]: value }));
    };

    const handleListChange = (field: 'goals' | 'painPoints', index: number, value: string) => {
        const newList = [...localPersona[field]];
        newList[index] = value;
        setLocalPersona(prev => ({...prev!, [field]: newList}));
    };

    const headerActions = isPreview ? null : (
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
        <Card title="Customer Persona" icon="fa-user-circle" color="blue" headerActions={headerActions}>
            <div className="space-y-3">
                {isEditing ? (
                    <EditInput value={localPersona.name} onChange={(e) => handleChange('name', e.target.value)} />
                ) : (
                    <h4 className="text-lg font-bold text-blue-300">{persona.name}</h4>
                )}
                
                {isEditing ? (
                    <EditArea value={localPersona.bio} onChange={(e) => handleChange('bio', e.target.value)} />
                ) : (
                    <p className="text-sm italic bg-gray-900/50 p-2 rounded-md">"{persona.bio}"</p>
                )}

                <div>
                    <h5 className="font-semibold">Demographics:</h5>
                    {isEditing ? (
                         <EditInput value={localPersona.demographics} onChange={(e) => handleChange('demographics', e.target.value)} />
                    ) : (
                        <p className="text-sm text-gray-400">{persona.demographics}</p>
                    )}
                </div>
                <div>
                    <h5 className="font-semibold">Goals:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        {isEditing ? 
                            localPersona.goals.map((g, i) => <li key={i}><EditInput value={g} onChange={(e) => handleListChange('goals', i, e.target.value)} /></li>) :
                            persona.goals.map((g, i) => <li key={i}>{g}</li>)
                        }
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold">Pain Points:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                         {isEditing ? 
                            localPersona.painPoints.map((p, i) => <li key={i}><EditInput value={p} onChange={(e) => handleListChange('painPoints', i, e.target.value)} /></li>) :
                            persona.painPoints.map((p, i) => <li key={i}>{p}</li>)
                        }
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default PersonaCard;