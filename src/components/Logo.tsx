import React from 'react';

export const Logo: React.FC<{ persona: 'Agent Zero' | 'Agent Zara' }> = ({ persona }) => {
    const isZero = persona === 'Agent Zero';
    return (
        <svg
            width="44"
            height="44"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Hexagonal Frame */}
            <path
                d="M50 2.5 L95.5 26.25 L95.5 73.75 L50 97.5 L4.5 73.75 L4.5 26.25 Z"
                fill="rgba(10, 10, 30, 0.5)"
                strokeWidth="3"
                className={isZero ? 'logo-accent-zero' : 'logo-accent-one'}
            />
            
            {/* W Shape */}
            <g 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={isZero ? 'logo-accent-zero' : 'logo-accent-one'}
                fill="none"
            >
                <path d="M25 25 L40 75 L50 45 L60 75 L75 25" />
            </g>
            
            {/* Orbiting dot for dynamism */}
            <g className="logo-orbit">
                <circle
                    cx="15"
                    cy="50"
                    r="4"
                    className={`logo-dot ${isZero ? 'logo-main-zero' : 'logo-main-one'}`}
                />
            </g>
        </svg>
    );
};

export default Logo;