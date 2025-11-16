import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

const WebSearchIndicator: React.FC<{ topic: string }> = ({ topic }) => {
    const steps = useMemo(() => [
        "Initializing web agent...",
        "Querying search indexes...",
        "Analyzing top results from the web...",
        "Cross-referencing information for accuracy...",
        "Synthesizing findings into a response...",
    ], []);

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [steps.length]);

    const title = `Searching the web for "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`;

    return (
        <div className="message-capsule animate-fade-in">
            <div className="capsule-sender sender-system">SYSTEM</div>
            <div className="capsule-content flex flex-col gap-2">
                <p className="text-sm text-cyan-300 font-mono transition-opacity duration-500 font-semibold">{title}</p>
                <ul className="space-y-1.5 text-xs text-gray-400 pl-1 mt-1">
                    {steps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2 transition-all duration-500">
                            {index < currentStep ? (
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                            ) : index === currentStep ? (
                                <Loader size={14} className="text-cyan-400 animate-spin flex-shrink-0" />
                            ) : (
                                <div className="w-[14px] h-[14px] border-2 border-gray-600 rounded-full flex-shrink-0" />
                            )}
                            <span className={`${index < currentStep ? 'opacity-50 line-through' : ''} ${index === currentStep ? 'text-cyan-300' : ''}`}>
                                {step}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebSearchIndicator;