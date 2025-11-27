
import React, { ReactNode, useState } from 'react';

interface CardProps {
    title: string;
    icon: string;
    children: ReactNode;
    headerActions?: ReactNode;
    color?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, headerActions, color = 'indigo' }) => {
    const [colSpan, setColSpan] = useState(1);

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

    const toggleSize = () => {
        setColSpan(prev => prev >= 3 ? 1 : prev + 1);
    };

    const colSpanClass = colSpan === 3 ? 'lg:col-span-3' : colSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-1';

    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${colorClasses[color]} shadow-lg transition-all hover:shadow-indigo-500/20 ${colSpanClass}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <i className={`fas ${icon} ${iconColorClasses[color]} text-xl`}></i>
                            <h3 className="text-xl font-bold">{title}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        <button onClick={toggleSize} className="text-gray-500 hover:text-white transition-colors ml-2" title="Resize Card">
                            <i className={`fas ${colSpan === 3 ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
                    </div>
                </div>
                <div className="mt-4 text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Card;
