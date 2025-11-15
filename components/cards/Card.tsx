import React, { ReactNode } from 'react';

interface CardProps {
    title: string;
    icon: string;
    children: ReactNode;
    headerActions?: ReactNode;
    color?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, headerActions, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'border-indigo-500/50',
        blue: 'border-blue-500/50',
        green: 'border-green-500/50',
        purple: 'border-purple-500/50',
    };

    const iconColorClasses = {
        indigo: 'text-indigo-400',
        blue: 'text-blue-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
    };

    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${colorClasses[color]} shadow-lg transition-all hover:shadow-indigo-500/20`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <i className={`fas ${icon} ${iconColorClasses[color]} text-xl`}></i>
                            <h3 className="text-xl font-bold">{title}</h3>
                        </div>
                    </div>
                    {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
                </div>
                <div className="mt-4 text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Card;