import React from 'react';

interface TutorialProps {
    onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 text-center p-8">
                <h1 className="text-3xl font-bold mb-4 text-indigo-400">Welcome to the Robo AI Planner!</h1>
                <p className="text-gray-300 mb-6">
                    This tool guides you through planning and building a successful app, from idea to launch.
                </p>
                <div className="text-left space-y-4 mb-8">
                    <div className="flex items-start gap-4">
                        <i className="fas fa-lightbulb text-2xl text-yellow-400 mt-1"></i>
                        <div>
                            <h3 className="font-semibold text-lg">1. Start with an Idea</h3>
                            <p className="text-gray-400">Enter your app idea or let our AI generate one for you. We'll then help you improve and validate it.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <i className="fas fa-cogs text-2xl text-blue-400 mt-1"></i>
                        <div>
                            <h3 className="font-semibold text-lg">2. Build the Foundations</h3>
                            <p className="text-gray-400">Generate customer personas, pricing plans, and a recommended tech stack. These will appear as cards on your canvas.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <i className="fas fa-code text-2xl text-green-400 mt-1"></i>
                        <div>
                            <h3 className="font-semibold text-lg">3. Generate Your MVP & Prompts</h3>
                            <p className="text-gray-400">Create a step-by-step MVP plan and generate detailed prompts for each step to use with your favorite AI coding assistant.</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default Tutorial;