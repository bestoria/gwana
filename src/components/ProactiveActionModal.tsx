import React from 'react';
import { X, Check, BrainCircuit } from 'lucide-react';
import type { ProactiveAction, Message } from '@/src/lib/types';
import { AI_MODES } from '@/src/lib/constants';
import { formatText, linkifyText } from '@/src/lib/utils';

interface ProactiveActionModalProps {
    action: ProactiveAction;
    onAccept: () => void;
    onDismiss: () => void;
}

const ProactiveActionModal: React.FC<ProactiveActionModalProps> = ({ action, onAccept, onDismiss }) => {
    const allModes = AI_MODES;
    const targetModeInfo = allModes.find(m => m.mode === action.targetMode);
    
    // Simple renderer for the generated content
    const renderContent = (content: Message) => {
        if (content.text) {
            return <div className="text-sm text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: linkifyText(formatText(content.text)) }} />;
        }
        // Add more content types here in the future if needed
        return <p className="text-sm text-gray-400">[Unsupported proactive content type]</p>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in" onClick={onDismiss}>
            <div className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full shadow-2xl" style={{ boxShadow: '0 0 20px var(--accent-cyan)'}} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <BrainCircuit size={24} /> Proactive Action
                    </h2>
                    <button onClick={onDismiss} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-sm text-gray-300 mb-4">{action.actionDescription}</p>
                <div className="p-3 bg-black/30 border border-cyan-500/30 rounded-md max-h-60 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2">
                        {targetModeInfo?.icon && <span className="text-lg">{targetModeInfo.icon}</span>}
                        <h3 className="font-semibold text-cyan-400">Content for {targetModeInfo?.name}</h3>
                    </div>
                    {renderContent(action.generatedContent)}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onDismiss} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-600/50 transition-colors">
                        Dismiss
                    </button>
                    <button onClick={onAccept} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors flex items-center gap-2">
                        <Check size={16} /> Accept & Switch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProactiveActionModal;