import React, { useState, useEffect } from 'react';
import Card from './Card';
import { AppPlan, TechStack } from '../../types';

interface TechStackCardProps {
    techStack: TechStack;
    updatePlan?: (updates: Partial<AppPlan>) => void;
}

const EditInput: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ value, onChange }) => (
    <input type="text" value={value} onChange={onChange} className="w-full text-sm p-1 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition" />
);

const TechStackCard: React.FC<TechStackCardProps> = ({ techStack, updatePlan }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localStack, setLocalStack] = useState(techStack);

    useEffect(() => {
        setLocalStack(techStack);
    }, [techStack]);

    const handleSave = () => {
        if (updatePlan) {
            updatePlan({ techStack: localStack });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalStack(techStack);
        setIsEditing(false);
    };

    const handleChange = (field: keyof TechStack, value: string) => {
        setLocalStack(prev => ({ ...prev, [field]: value }));
    };
    
    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...localStack.services];
        newServices[index] = value;
        setLocalStack(prev => ({...prev, services: newServices}));
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

    const renderField = (label: string, field: keyof TechStack) => (
        <p><strong>{label}:</strong> {isEditing ? <EditInput value={localStack[field] as string} onChange={(e) => handleChange(field, e.target.value)} /> : techStack[field]}</p>
    );

    return (
        <Card title="Tech Stack" icon="fa-cogs" color="green" headerActions={headerActions}>
            <div className="space-y-2">
                 <div className="bg-gray-900/50 p-2 rounded-md">
                    {isEditing ? <EditInput value={localStack.category} onChange={(e) => handleChange('category', e.target.value)} /> : <span className="font-semibold text-green-400">{techStack.category}</span>}
                </div>
                {renderField('Backend', 'backend')}
                {renderField('Database', 'database')}
                {renderField('Authentication', 'authentication')}
                {renderField('Payments', 'payments')}
                
                <p><strong>Services/APIs:</strong></p>
                <ul className="list-disc list-inside pl-4 text-sm text-gray-400 space-y-1">
                    {isEditing ?
                        localStack.services.map((s, i) => <li key={i}><EditInput value={s} onChange={e => handleServiceChange(i, e.target.value)} /></li>) :
                        techStack.services.map((s, i) => <li key={i}>{s}</li>)
                    }
                </ul>
            </div>
        </Card>
    );
};

export default TechStackCard;