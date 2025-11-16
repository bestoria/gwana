import React from 'react';

const ThinkingIndicator: React.FC = () => (
    <div className="message-capsule animate-fade-in">
        <div className="capsule-sender sender-system">SYSTEM</div>
        <div className="capsule-content flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle className="thinking-indicator-ring" cx="50" cy="50" r="45" fill="none" stroke="var(--accent-magenta)" strokeWidth="10" style={{ animationDelay: '0s' }}/>
                <circle className="thinking-indicator-ring" cx="50" cy="50" r="30" fill="none" stroke="var(--accent-cyan)" strokeWidth="8" style={{ animationDelay: '-0.5s' }}/>
            </svg>
            <span className="text-sm text-purple-300 font-mono">PROCESSING...</span>
        </div>
    </div>
);

export default ThinkingIndicator;
