import React, { useState } from 'react';
import { Sparkles, Copy, Download, RefreshCw, FileText, Loader } from 'lucide-react';
import { getAssistantResponse } from '../services/geminiService';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import NeonButton from './cyberpunk/NeonButton';

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
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full space-y-4">
                <HolographicPanel glowColor="purple" withGrid withCorners>
                    <div className="p-6 space-y-4">
                        <HolographicText 
                            className="text-center text-lg font-bold tracking-widest flex items-center justify-center gap-2" 
                            glowColor="purple" 
                            flickerEffect
                        >
                            <Sparkles size={24} className="animate-pulse" />
                            AI WRITING ASSISTANT
                            <FileText size={20} />
                        </HolographicText>

                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <HolographicText className="text-xs tracking-wide opacity-70">WRITING MODE</HolographicText>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {WRITING_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedMode(mode.id)}
                                        className={`p-3 rounded-lg border transition-all text-sm ${
                                            selectedMode === mode.id
                                                ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                                                : 'bg-black/20 border-gray-700 hover:border-purple-600'
                                        }`}
                                    >
                                        {mode.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="space-y-2">
                            <HolographicText className="text-xs tracking-wide opacity-70">
                                {WRITING_MODES.find(m => m.id === selectedMode)?.prompt}
                            </HolographicText>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter your topic or text here..."
                                rows={4}
                                className="w-full bg-black/40 border border-purple-600/30 rounded-lg p-4 text-sm text-purple-100 placeholder-purple-800 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                            />
                        </div>

                        {/* Generate Button */}
                        <NeonButton
                            onClick={handleGenerate}
                            disabled={!topic.trim() || isGenerating}
                            fullWidth
                            size="large"
                            color="purple"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    GENERATING...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    GENERATE CONTENT
                                </>
                            )}
                        </NeonButton>
                    </div>
                </HolographicPanel>

                {/* Generated Content */}
                {generatedContent && (
                    <HolographicPanel glowColor="cyan" withScanlines>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <HolographicText className="text-sm font-bold tracking-wide" glowColor="cyan">
                                    GENERATED CONTENT
                                </HolographicText>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded bg-black/40 border border-cyan-600/30 hover:border-cyan-400 transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-2 rounded bg-black/40 border border-cyan-600/30 hover:border-cyan-400 transition-colors"
                                        title="Download as file"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-black/40 border border-cyan-600/20 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
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
