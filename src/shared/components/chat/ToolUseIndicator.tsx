import React from 'react';
import { Compass, ImageIcon, BrainCircuit } from 'lucide-react';

const ToolUseIndicator: React.FC<{ toolName: string }> = ({ toolName }) => {
    const tools: Record<string, { icon: React.ElementType, label: string }> = {
        googleSearch: { icon: Compass, label: 'Google Search' },
        googleMaps: { icon: Compass, label: 'Google Maps' },
        generate_image: { icon: ImageIcon, label: 'Image Generation' },
        create_memory: { icon: BrainCircuit, label: 'Memory Core' }
    };

    const tool = tools[toolName];
    if (!tool) return null;

    const { icon: Icon, label } = tool;

    return (
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-2 border-b border-cyan-500/20 pb-2 animate-fade-in">
            <Icon size={14} />
            <span className="opacity-80">Tool Used:</span>
            <span className="font-semibold">{label}</span>
        </div>
    );
};

export default ToolUseIndicator;
