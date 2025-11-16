import React, { useState } from 'react';
import { Sparkles, Copy, Download, RefreshCw, FileText, Loader } from 'lucide-react';
import { getAssistantResponse } from '@/src/services/geminiService';
import HolographicPanel from '@/src/shared/components/cyberpunk/HolographicPanel';
import HolographicText from '@/src/shared/components/cyberpunk/HolographicText';
import NeonButton from '@/src/shared/components/cyberpunk/NeonButton';

const WRITING_MODES = [
    { id: 'blog', name: 'Blog Post', prompt: 'Write an engaging blog post about:' },
    { id: 'email', name: 'Email', prompt: 'Write a professional email about:' },
    { id: 'social', name: 'Social Media', prompt: 'Write a compelling social media post about:' },
    { id: 'essay', name: 'Essay', prompt: 'Write a detailed essay about:' },
    { id: 'story', name: 'Story', prompt: 'Write a creative story about:' },
    { id: 'summary', name: 'Summary', prompt: 'Summarize the following content:' },
    { id: 'improve', name: 'Improve Text', prompt: 'Improve and refine the following text:' },
    { id: 'translate', name: 'Translate', prompt: 'Translate the following text to [target language]:' }
];

const AIWritingAssistant: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState('blog');
    const [topic, setTopic] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        const mode = WRITING_MODES.find(m => m.id === selectedMode);
        const fullPrompt = `${mode?.prompt} ${topic}`;

        try {
            const response = await getAssistantResponse(fullPrompt);
            setGeneratedContent(response || 'Failed to generate content.');
        } catch (error) {
            setGeneratedContent('Error generating content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-${selectedMode}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto w-full space-y-4">
                <HolographicPanel glowColor="magenta" withGrid withCorners>
                    <div className="p-4 space-y-3">
                        <HolographicText 
                            className="text-center text-base font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="magenta" 
                            flickerEffect
                        >
                            <Sparkles size={20} className="animate-pulse" />
                            AI WRITING ASSISTANT
                            <FileText size={18} />
                        </HolographicText>

                        {/* Mode Selection */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">MODE</HolographicText>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                                {WRITING_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`px-2 py-1.5 rounded text-[10px] transition-all ${
                                            selectedMode === mode.id
                                                ? 'border-2'
                                                : 'border'
                                        }`}
                                        style={{
                                            backgroundColor: selectedMode === mode.id ? 'rgba(255, 0, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                                            borderColor: selectedMode === mode.id ? 'var(--accent-magenta)' : 'rgba(160, 160, 192, 0.3)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {mode.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="space-y-2">
                            <HolographicText className="text-[10px] tracking-wide opacity-70">TOPIC</HolographicText>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter your topic or text..."
                                rows={3}
                                className="w-full rounded p-3 text-xs resize-none"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        {/* Generate Button */}
                        <NeonButton
                            onClick={handleGenerate}
                            disabled={!topic.trim() || isGenerating}
                            fullWidth
                            size="large"
                            color="magenta"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    GENERATING...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    GENERATE CONTENT
                                </>
                            )}
                        </NeonButton>
                    </div>
                </HolographicPanel>

                {/* Generated Content */}
                {generatedContent && (
                    <HolographicPanel glowColor="cyan" withScanlines>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <HolographicText className="text-sm font-bold tracking-wide" glowColor="cyan">
                                    GENERATED CONTENT
                                </HolographicText>
                                <div className="flex gap-2">
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
                                    <button
                                        onClick={handleDownload}
                                        className="p-2 rounded transition-colors"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            border: '1px solid rgba(0, 255, 255, 0.3)'
                                        }}
                                        title="Download as file"
                                    >
                                        <Download size={14} style={{ color: 'var(--accent-cyan)' }} />
                                    </button>
                                </div>
                            </div>
                            
                            <div 
                                className="rounded-lg p-4 overflow-y-auto"
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(0, 255, 255, 0.2)',
                                    maxHeight: '400px'
                                }}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                                    {generatedContent}
                                </p>
                            </div>
                        </div>
                    </HolographicPanel>
                )}
            </div>
        </div>
    );
};

export default AIWritingAssistant;
