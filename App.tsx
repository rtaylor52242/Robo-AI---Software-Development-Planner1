import React, { useState, useCallback, useEffect } from 'react';
import { AppPlan, AppPhase, Persona, TechStack, MvpStep, Feature, PricingTier } from './types';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Tutorial from './components/Tutorial';
import { generateInitialIdeas } from './services/geminiService';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

const App: React.FC = () => {
    const [plan, setPlan] = useState<AppPlan | null>(null);
    const [currentPhase, setCurrentPhase] = useState<AppPhase>(AppPhase.SETUP);
    const [loading, setLoading] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [initialIdeaCategory, setInitialIdeaCategory] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const updatePlan = useCallback((updates: Partial<AppPlan>) => {
        setPlan(prev => prev ? { ...prev, ...updates } : null);
    }, []);
    
    useEffect(() => {
      const savedTutorialState = localStorage.getItem('showTutorial');
      if (savedTutorialState === 'false') {
          setShowTutorial(false);
      }
    }, []);

    const handleStartNewApp = (idea: string) => {
        setPlan({
            idea: idea,
            ideaImprovements: [],
            marketValidation: null,
            persona: null,
            pricing: [],
            techStack: null,
            mvpPlan: [],
            features: [],
        });
        setCurrentPhase(AppPhase.FOUNDATIONS);
        setGeneratedIdeas([]);
        setInitialIdeaCategory('');
    };

    const handleGenerateIdeas = async () => {
        if (!initialIdeaCategory) {
            setError('Please enter a category.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const ideas = await generateInitialIdeas(initialIdeaCategory);
            setGeneratedIdeas(ideas);
        } catch (e) {
            setError('Failed to generate ideas. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('showTutorial', 'false');
    };

    const resetApp = () => {
        setPlan(null);
        setCurrentPhase(AppPhase.SETUP);
        setGeneratedIdeas([]);
        setInitialIdeaCategory('');
    };

    const handleExportPDF = () => {
        setIsExportMenuOpen(false);
        const canvasElement = document.querySelector('main');
        if (!canvasElement || !window.html2canvas || !window.jspdf) {
            alert("PDF export functionality is not available.");
            return;
        }

        setTimeout(() => {
            const scrollWidth = canvasElement.scrollWidth;
            const scrollHeight = canvasElement.scrollHeight;

            window.html2canvas(canvasElement, { 
                scale: 2,
                backgroundColor: '#111827', // bg-gray-900
                width: scrollWidth,
                height: scrollHeight,
                windowWidth: scrollWidth,
                windowHeight: scrollHeight,
            }).then((canvas: HTMLCanvasElement) => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'l' : 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
    
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${plan?.idea.replace(/ /g, '_') || 'app_plan'}.pdf`);
            });
        }, 100);
    };

    const generateTextPlan = (plan: AppPlan | null): string => {
        if (!plan) return "<h1>No plan available</h1>";
    
        const section = (title: string, content: string) => `<h2>${title}</h2><div>${content}</div><br/>`;
        const list = (items: string[]) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    
        let html = `<h1>App Plan: ${plan.idea}</h1>`;
    
        if (plan.ideaImprovements.length > 0) {
            html += section('Idea Improvements', list(plan.ideaImprovements));
        }
    
        if (plan.marketValidation) {
            html += section('Market Validation',
                `<p><b>Core Problem:</b> ${plan.marketValidation.coreProblem}</p>` +
                `<p><b>Founder Profile:</b> ${plan.marketValidation.founderProfile}</p>` +
                `<p><b>Community Research:</b> ${list(plan.marketValidation.communityResearch)}</p>` +
                `<p><b>Competitors:</b> ${list(plan.marketValidation.competitors)}</p>` +
                `<p><b>Differentiation:</b> ${list(plan.marketValidation.differentiation)}</p>` +
                `<p><b>Risk Assessment:</b> ${plan.marketValidation.riskAssessment}</p>`
            );
        }
        
        if (plan.persona) {
            html += section(`Customer Persona: ${plan.persona.name}`,
                 `<p><b>Bio:</b> ${plan.persona.bio}</p>` +
                 `<p><b>Demographics:</b> ${plan.persona.demographics}</p>` +
                 `<b>Goals:</b>${list(plan.persona.goals)}` +
                 `<b>Pain Points:</b>${list(plan.persona.painPoints)}`
            );
        }

        if (plan.techStack) {
            html += section('Tech Stack',
                `<p><b>Category:</b> ${plan.techStack.category}</p>` +
                `<p><b>Backend:</b> ${plan.techStack.backend}</p>` +
                `<p><b>Database:</b> ${plan.techStack.database}</p>` +
                `<p><b>Authentication:</b> ${plan.techStack.authentication}</p>` +
                `<p><b>Payments:</b> ${plan.techStack.payments}</p>` +
                `<b>Services:</b> ${list(plan.techStack.services)}`
            );
        }

        if (plan.mvpPlan.length > 0) {
            html += section('MVP Plan', list(plan.mvpPlan.map(step => `${step.title} (${step.completed ? 'Completed' : 'Pending'})`)));
        }

        if (plan.features.length > 0) {
            html += section('Features', list(plan.features.map(f => `${f.title} (Impact: ${f.impact})`)));
        }
    
        return html;
    };

    const handleExportWord = () => {
        setIsExportMenuOpen(false);
        const content = generateTextPlan(plan);
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
                "xmlns:w='urn:schemas-microsoft-com:office:word' "+
                "xmlns='http://www.w3.org/TR/REC-html40'>"+
                "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;
    
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${plan?.idea.replace(/ /g, '_') || 'app_plan'}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
            <Sidebar currentPhase={currentPhase} plan={plan} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <div className="relative">
                        <button 
                            onClick={() => setIsExportMenuOpen(prev => !prev)}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                            <i className="fas fa-file-export mr-2"></i>Export
                        </button>
                        {isExportMenuOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                                <a onClick={handleExportPDF} className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white cursor-pointer">Export as PDF</a>
                                <a onClick={handleExportWord} className="block px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white cursor-pointer">Export as Word</a>
                            </div>
                        )}
                    </div>
                     <button
                        onClick={() => setShowTutorial(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                        <i className="fas fa-question-circle mr-2"></i>Help
                    </button>
                    <button 
                      onClick={resetApp}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                        <i className="fas fa-sync-alt mr-2"></i>New Project
                    </button>
                </div>


                {!plan ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg text-center">
                            <h1 className="text-3xl font-bold mb-2 text-indigo-400">Robo AI - Software Development Planner</h1>
                            <p className="text-gray-400 mb-6">Let's build your next big idea.</p>
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="Enter your app idea to start..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).value && handleStartNewApp((e.target as HTMLInputElement).value)}
                                    className="w-full p-3 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                                />
                                <p className="text-gray-500 text-sm mt-2">Press Enter to begin.</p>
                            </div>
                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-600"></div>
                                <span className="flex-shrink mx-4 text-gray-500">Or</span>
                                <div className="flex-grow border-t border-gray-600"></div>
                            </div>
                            <div className="w-full flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={initialIdeaCategory}
                                    onChange={(e) => setInitialIdeaCategory(e.target.value)}
                                    placeholder="e.g., fitness, productivity..."
                                    className="flex-grow p-3 bg-gray-700 rounded-md border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                                />
                                <button
                                    onClick={handleGenerateIdeas}
                                    disabled={loading}
                                    className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-500"
                                >
                                    {loading ? 'Generating...' : 'Generate Ideas'}
                                </button>
                            </div>
                            {error && <p className="text-red-400 mt-4">{error}</p>}
                            {generatedIdeas.length > 0 && (
                                <div className="mt-6 text-left">
                                    <h3 className="font-semibold text-lg mb-2">Choose an idea:</h3>
                                    <ul className="space-y-2">
                                        {generatedIdeas.map((idea, index) => (
                                            <li key={index}
                                                onClick={() => handleStartNewApp(idea)}
                                                className="bg-gray-700 p-3 rounded-md hover:bg-indigo-500 hover:text-white cursor-pointer transition">
                                                {idea}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <Canvas plan={plan} updatePlan={updatePlan} setCurrentPhase={setCurrentPhase} loading={loading} setLoading={setLoading}/>
                )}
            </main>
        </div>
    );
};

export default App;