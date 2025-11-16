import React, { useState } from 'react';
import { Code, Copy, Terminal, Sparkles, Loader, CheckCircle } from 'lucide-react';
import { getAssistantResponse } from '@/src/services/geminiService';
import HolographicPanel from '@/src/shared/components/cyberpunk/HolographicPanel';
import HolographicText from '@/src/shared/components/cyberpunk/HolographicText';
import NeonButton from '@/src/shared/components/cyberpunk/NeonButton';

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
        <div className="flex flex-col h-full p-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto w-full space-y-4">
                <HolographicPanel glowColor="green" withGrid withCorners>
                    <div className="p-4 space-y-3">
                        <HolographicText 
                            className="text-center text-base font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="green" 
                            flickerEffect
                        >
                            <Code size={20} className="animate-pulse" />
                            AI CODE ASSISTANT
                            <Terminal size={18} />
                        </HolographicText>

                        {/* Task Type Selection */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">TASK</HolographicText>
                            <div className="grid grid-cols-4 gap-1">
                                {TASK_TYPES.map(task => {
                                    const Icon = task.icon;
                                    return (
                                        <button
                                            key={task.id}
                                            onClick={() => setTaskType(task.id)}
                                            className="px-2 py-1.5 rounded text-[10px] transition-all flex items-center justify-center gap-1"
                                            style={{
                                                backgroundColor: taskType === task.id ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                                                border: taskType === task.id ? '2px solid var(--accent-green)' : '1px solid rgba(160, 160, 192, 0.3)',
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            <Icon size={12} />
                                            <span>{task.name.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">LANGUAGE</HolographicText>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full rounded px-3 py-2 text-xs focus:outline-none"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang} style={{ backgroundColor: 'var(--bg-secondary)' }}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Input */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">
                                {taskType === 'generate' ? 'DESCRIPTION' : 'CODE INPUT'}
                            </HolographicText>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={taskType === 'generate' ? 'Describe the function you need...' : 'Paste your code here...'}
                                rows={8}
                                className="w-full rounded p-3 text-xs resize-none font-mono"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
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
                                    <Loader size={16} className="animate-spin" />
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    {taskType === 'generate' ? 'GENERATE CODE' : taskType.toUpperCase()}
                                </>
                            )}
                        </NeonButton>
                    </div>
                </HolographicPanel>

                {/* Output */}
                {output && (
                    <HolographicPanel glowColor="cyan" withScanlines>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <HolographicText className="text-sm font-bold tracking-wide" glowColor="cyan">
                                    OUTPUT
                                </HolographicText>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded transition-colors"
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        border: '1px solid rgba(0, 255, 255, 0.3)'
                                    }}
                                    title="Copy to clipboard"
                                >
                                    <Copy size={14} style={{ color: 'var(--accent-cyan)' }} />
                                </button>
                            </div>
                            
                            <div 
                                className="rounded-lg p-4 overflow-y-auto font-mono"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    border: '1px solid rgba(0, 255, 255, 0.2)',
                                    maxHeight: '500px'
                                }}
                            >
                                <pre className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
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
