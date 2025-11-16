import React, { useState } from 'react';
import { Code, Copy, Terminal, Sparkles, Loader, CheckCircle } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import NeonButton from './cyberpunk/NeonButton';

const LANGUAGES = [
    'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift'
];

const TASK_TYPES = [
    { id: 'generate', name: 'Generate Code', icon: Code },
    { id: 'explain', name: 'Explain Code', icon: Terminal },
    { id: 'debug', name: 'Debug Code', icon: CheckCircle },
    { id: 'optimize', name: 'Optimize Code', icon: Sparkles }
];

const CodeHelper: React.FC = () => {
    const [taskType, setTaskType] = useState('generate');
    const [language, setLanguage] = useState('JavaScript');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        let prompt = '';

        switch (taskType) {
            case 'generate':
                prompt = `Generate clean, well-commented ${language} code for: ${input}`;
                break;
            case 'explain':
                prompt = `Explain the following ${language} code in detail:\n\n${input}`;
                break;
            case 'debug':
                prompt = `Debug and fix the following ${language} code. Explain what was wrong and provide the corrected version:\n\n${input}`;
                break;
            case 'optimize':
                prompt = `Optimize the following ${language} code for better performance and readability:\n\n${input}`;
                break;
        }

        try {
            const response = await getAssistantResponse(prompt);
            setOutput(response || 'Failed to process request.');
        } catch (error) {
            setOutput('Error processing request. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full space-y-4">
                <HolographicPanel glowColor="green" withGrid withCorners>
                    <div className="p-6 space-y-4">
                        <HolographicText 
                            className="text-center text-lg font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="green" 
                            flickerEffect
                        >
                            <Code size={24} className="animate-pulse" />
                            AI CODE ASSISTANT
                            <Terminal size={20} />
                        </HolographicText>

                        {/* Task Type Selection - Compact */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">TASK</HolographicText>
                            <div className="grid grid-cols-4 gap-1">
                                {TASK_TYPES.map(task => {
                                    const Icon = task.icon;
                                    return (
                                        <button
                                            key={task.id}
                                            onClick={() => setTaskType(task.id)}
                                            className={`px-2 py-1 rounded border transition-all flex items-center gap-1 text-[10px] ${
                                                taskType === task.id
                                                    ? 'bg-green-500/20 border-green-400'
                                                    : 'bg-black/20 border-gray-700 hover:border-green-600'
                                            }`}
                                        >
                                            <Icon size={12} />
                                            {task.name.split(' ')[0]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Language Selection - Compact */}
                        <div className="space-y-1">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">LANG</HolographicText>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-black/40 border border-green-600/30 rounded px-2 py-1 text-xs text-green-100 focus:outline-none focus:border-green-400"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Input - Compact */}
                        <div className="space-y-1">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">
                                {taskType === 'generate' ? 'DESCRIBE' : 'CODE'}
                            </HolographicText>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={taskType === 'generate' ? 'Function that...' : 'Paste code...'}
                                rows={6}
                                className="w-full bg-black/40 border border-green-600/30 rounded p-2 text-xs text-green-100 placeholder-green-800 focus:outline-none focus:border-green-400 resize-none font-mono"
                            />
                        </div>

                        {/* Process Button */}
                        <NeonButton
                            onClick={handleProcess}
                            disabled={!input.trim() || isProcessing}
                            fullWidth
                            size="large"
                            color="green"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    {taskType === 'generate' ? 'GENERATE CODE' : taskType.toUpperCase()}
                                </>
                            )}
                        </NeonButton>
                    </div>
                </HolographicPanel>

                {/* Output */}
                {output && (
                    <HolographicPanel glowColor="cyan" withScanlines>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <HolographicText className="text-sm font-bold tracking-wide" glowColor="cyan">
                                    OUTPUT
                                </HolographicText>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded bg-black/40 border border-cyan-600/30 hover:border-cyan-400 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            
                            <div className="bg-black/60 border border-cyan-600/20 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                                <pre className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap font-mono">
                                    {output}
                                </pre>
                            </div>
                        </div>
                    </HolographicPanel>
                )}
            </div>
        </div>
    );
};

export default CodeHelper;
