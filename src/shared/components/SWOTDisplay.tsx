import React from 'react';
import { Zap, ShieldOff, Lightbulb, TrendingUp } from 'lucide-react';
import type { SWOTContent } from '@/src/lib/types';

interface SWOTDisplayProps {
  swot: SWOTContent;
}

interface GridItemProps {
    title: string;
    items: string[];
    icon: React.ElementType;
    colorClass: string;
}

const GridItem: React.FC<GridItemProps> = ({ title, items, icon: Icon, colorClass }) => (
    <div className="p-3 rounded-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(160, 160, 192, 0.3)' }}>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colorClass }}>
            <Icon size={16} /> {title}
        </h4>
        <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const SWOTDisplay: React.FC<SWOTDisplayProps> = ({ swot }) => {
    if (!swot) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-3" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                SWOT ANALYSIS: {swot.topic.toUpperCase()}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <GridItem title="Strengths" items={swot.strengths} icon={Zap} colorClass="var(--accent-green)" />
                <GridItem title="Weaknesses" items={swot.weaknesses} icon={ShieldOff} colorClass="#ff0055" />
                <GridItem title="Opportunities" items={swot.opportunities} icon={Lightbulb} colorClass="var(--accent-amber)" />
                <GridItem title="Threats" items={swot.threats} icon={TrendingUp} colorClass="var(--accent-magenta)" />
            </div>
        </div>
    );
};

export default SWOTDisplay;