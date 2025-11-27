
import React, { useState } from 'react';
import Card from './Card';
import { UserProfile } from '../../types';

interface UserProfileCardProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile, setUserProfile }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [newTech, setNewTech] = useState('');

    const handleChange = (field: keyof UserProfile, value: string) => {
        setUserProfile({ ...userProfile, [field]: value });
    };

    const addTech = () => {
        if (newTech.trim()) {
            setUserProfile({
                ...userProfile,
                techPreferences: [...userProfile.techPreferences, newTech.trim()]
            });
            setNewTech('');
        }
    };

    const removeTech = (index: number) => {
        const newTechs = [...userProfile.techPreferences];
        newTechs.splice(index, 1);
        setUserProfile({ ...userProfile, techPreferences: newTechs });
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
                <button onClick={() => setIsEditing(false)} className="text-green-400 hover:text-green-300 transition-colors"><i className="fas fa-save"></i></button>
            )}
        </div>
    );

    return (
        <Card title="User Profile & Preferences" icon="fa-id-card" color="indigo" headerActions={headerActions}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase">Name</label>
                        {isEditing ? (
                            <input type="text" value={userProfile.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="John Doe" />
                        ) : <p className="text-sm font-semibold">{userProfile.name || '-'}</p>}
                    </div>
                    <div>
                         <label className="text-xs text-gray-500 uppercase">Phone</label>
                        {isEditing ? (
                            <input type="text" value={userProfile.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="+1 555-0100" />
                        ) : <p className="text-sm font-semibold">{userProfile.phone || '-'}</p>}
                    </div>
                    <div className="md:col-span-2">
                         <label className="text-xs text-gray-500 uppercase">Address</label>
                        {isEditing ? (
                            <input type="text" value={userProfile.address} onChange={e => handleChange('address', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="123 Main St" />
                        ) : <p className="text-sm font-semibold">{userProfile.address || '-'}</p>}
                    </div>
                     <div className="md:col-span-2">
                         <label className="text-xs text-gray-500 uppercase">Bio</label>
                        {isEditing ? (
                            <textarea value={userProfile.bio} onChange={e => handleChange('bio', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={2} placeholder="A brief bio..." />
                        ) : <p className="text-sm font-semibold">{userProfile.bio || '-'}</p>}
                    </div>
                    <div className="md:col-span-2">
                         <label className="text-xs text-gray-500 uppercase">Website</label>
                        {isEditing ? (
                            <input type="text" value={userProfile.website} onChange={e => handleChange('website', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="https://example.com" />
                        ) : <p className="text-sm font-semibold">{userProfile.website || '-'}</p>}
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-2 text-indigo-300">Tech Stack Preferences</h4>
                    <p className="text-xs text-gray-400 mb-2">These preferences will guide the AI when generating tech recommendations.</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        {userProfile.techPreferences.map((tech, index) => (
                            <span key={index} className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                {tech}
                                {isEditing && (
                                    <button onClick={() => removeTech(index)} className="hover:text-white"><i className="fas fa-times"></i></button>
                                )}
                            </span>
                        ))}
                    </div>
                    
                    {isEditing && (
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newTech} 
                                onChange={e => setNewTech(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && addTech()}
                                className="flex-grow p-2 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                                placeholder="Add preference (e.g. React, Python)..." 
                            />
                            <button onClick={addTech} className="bg-indigo-600 px-3 rounded-md hover:bg-indigo-500"><i className="fas fa-plus"></i></button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default UserProfileCard;
