import React from 'react';
import { AppPlan, AppPhase } from '../types';

interface SidebarProps {
    currentPhase: AppPhase;
    plan: AppPlan | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPhase, plan }) => {
    const phases = Object.values(AppPhase);
    const currentPhaseIndex = phases.indexOf(currentPhase);

    const getPhaseStatus = (phase: AppPhase, index: number) => {
        if (!plan) return 'locked';
        if (index < currentPhaseIndex) return 'completed';
        if (index === currentPhaseIndex) return 'active';
        return 'locked';
    };

    const phaseIcons = {
        [AppPhase.SETUP]: 'fa-lightbulb',
        [AppPhase.FOUNDATIONS]: 'fa-building-columns',
        [AppPhase.FEATURES]: 'fa-star',
        [AppPhase.LAUNCH]: 'fa-rocket',
    };
    
    const phaseDescriptions = {
        [AppPhase.SETUP]: 'Define and refine your core app idea.',
        [AppPhase.FOUNDATIONS]: 'Validate your idea and set up the technical groundwork.',
        [AppPhase.FEATURES]: 'Outline your MVP and plan future features.',
        [AppPhase.LAUNCH]: 'Prepare for deployment and market launch.'
    }

    return (
        <aside className="w-16 md:w-72 bg-gray-900 border-r border-gray-700 p-4 md:p-6 flex flex-col justify-between transition-all duration-300">
            <div>
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <i className="fas fa-robot text-2xl"></i>
                    </div>
                    <h1 className="text-xl font-bold hidden md:block">Robo AI - Software Development Planner</h1>
                </div>
                <nav>
                    <ul>
                        {phases.map((phase, index) => {
                            const status = getPhaseStatus(phase, index);
                            return (
                                <li key={phase} className="mb-6 relative">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                                            ${status === 'completed' ? 'bg-green-500 border-green-400' : ''}
                                            ${status === 'active' ? 'bg-indigo-600 border-indigo-400 animate-pulse' : ''}
                                            ${status === 'locked' ? 'bg-gray-700 border-gray-600' : ''}
                                        `}>
                                            <i className={`fas ${phaseIcons[phase]} text-lg ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}></i>
                                        </div>
                                        <div className="hidden md:block">
                                            <h3 className={`font-semibold text-lg ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>{phase}</h3>
                                            <p className="text-sm text-gray-400">{phaseDescriptions[phase]}</p>
                                        </div>
                                    </div>
                                    {index < phases.length - 1 && (
                                        <div className={`absolute left-5 top-11 h-6 w-0.5
                                            ${index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-700'}
                                        `}></div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
            <div className="hidden md:block text-center text-sm text-gray-500">
                <p>&copy; 2024 Robo AI</p>
                <p className="mt-1">Free 3-day trial active.</p>
            </div>
        </aside>
    );
};

export default Sidebar;