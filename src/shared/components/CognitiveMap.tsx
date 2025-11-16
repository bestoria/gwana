import React, { useState, useEffect, useRef } from 'react';
import { Brain, X } from 'lucide-react';
import type { MemoryFragment, Persona } from '@/src/lib/types';
import { getMemoryFragments } from '@/src/lib/utils';


// Simple physics simulation parameters
const REPULSION_STRENGTH = 1000;
const ATTRACTION_STRENGTH = 0.02;
const MAX_SPEED = 5;
const DAMPING = 0.95;

interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    data: MemoryFragment;
}

const CognitiveMap: React.FC<{ persona: Persona, onClose: () => void }> = ({ persona, onClose }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

    useEffect(() => {
        const memories = getMemoryFragments(persona);
        if (memories.length > 0) {
            const initialNodes = memories.map((mem, i) => ({
                id: `node-${i}`,
                label: mem.topic,
                x: Math.random() * 500 + 100,
                y: Math.random() * 500 + 100,
                vx: 0,
                vy: 0,
                data: mem,
            }));
            setNodes(initialNodes);
        }
    }, [persona]);
    
    useEffect(() => {
        const tick = () => {
            setNodes(currentNodes => {
                if (currentNodes.length === 0) return [];
                const newNodes = JSON.parse(JSON.stringify(currentNodes)); // Deep copy for mutation
                const width = containerRef.current?.clientWidth || 800;
                const height = containerRef.current?.clientHeight || 800;
                const centerX = width / 2;
                const centerY = height / 2;

                // Apply forces
                for (let i = 0; i < newNodes.length; i++) {
                    const nodeA = newNodes[i];

                    // Repulsion from other nodes
                    for (let j = 0; j < newNodes.length; j++) {
                        if (i === j) continue;
                        const nodeB = newNodes[j];
                        const dx = nodeA.x - nodeB.x;
                        const dy = nodeA.y - nodeB.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 0) {
                            const force = REPULSION_STRENGTH / (distance * distance);
                            nodeA.vx += (dx / distance) * force;
                            nodeA.vy += (dy / distance) * force;
                        }
                    }

                    // Attraction to center
                    const dx = centerX - nodeA.x;
                    const dy = centerY - nodeA.y;
                    nodeA.vx += dx * ATTRACTION_STRENGTH;
                    nodeA.vy += dy * ATTRACTION_STRENGTH;
                    
                    // Damping
                    nodeA.vx *= DAMPING;
                    nodeA.vy *= DAMPING;

                    // Clamp speed
                    const speed = Math.sqrt(nodeA.vx * nodeA.vx + nodeA.vy * nodeA.vy);
                    if (speed > MAX_SPEED) {
                        nodeA.vx = (nodeA.vx / speed) * MAX_SPEED;
                        nodeA.vy = (nodeA.vy / speed) * MAX_SPEED;
                    }

                    // Update position
                    nodeA.x += nodeA.vx;
                    nodeA.y += nodeA.vy;
                    
                    const nodeRadius = 30; // Approximation of node size
                    // Boundary collision
                    if (nodeA.x < nodeRadius) { nodeA.x = nodeRadius; nodeA.vx *= -1; }
                    if (nodeA.x > width - nodeRadius) { nodeA.x = width - nodeRadius; nodeA.vx *= -1; }
                    if (nodeA.y < nodeRadius) { nodeA.y = nodeRadius; nodeA.vy *= -1; }
                    if (nodeA.y > height - nodeRadius) { nodeA.y = height - nodeRadius; nodeA.vy *= -1; }
                }

                return newNodes;
            });

            animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in" 
            onClick={onClose}
        >
            <div 
                className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col font-mono relative" 
                style={{ boxShadow: '0 0 20px var(--accent-cyan)'}} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                        <Brain size={24} /> Cognitive Map: {persona}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-black/30 rounded-md border border-gray-800">
                    {nodes.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No memory fragments recorded for this persona.
                        </div>
                    ) : (
                        <>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {nodes.map(node => (
                                    <line
                                        key={`line-center-${node.id}`}
                                        x1={containerRef.current?.clientWidth ? containerRef.current.clientWidth / 2 : 0}
                                        y1={containerRef.current?.clientHeight ? containerRef.current.clientHeight / 2 : 0}
                                        x2={node.x}
                                        y2={node.y}
                                        stroke="rgba(0, 255, 255, 0.1)"
                                        strokeWidth="1"
                                    />
                                ))}
                            </svg>
                            {nodes.map(node => (
                                <div
                                    key={node.id}
                                    className="absolute p-2 bg-cyan-900/50 border border-cyan-500 rounded-full text-white text-xs cursor-pointer select-none transition-all hover:scale-110 hover:z-10 flex items-center justify-center text-center"
                                    style={{
                                        transform: `translate(-50%, -50%)`,
                                        left: `${node.x}px`,
                                        top: `${node.y}px`,
                                        minWidth: '60px',
                                        minHeight: '60px',
                                    }}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {node.label}
                                </div>
                            ))}
                             {hoveredNode && (
                                <div 
                                    className="absolute p-3 bg-black/80 border border-gray-700 rounded-md text-white text-xs max-w-xs pointer-events-none z-20 animate-fade-in"
                                    style={{
                                        left: `${hoveredNode.x + 20}px`,
                                        top: `${hoveredNode.y + 20}px`,
                                    }}
                                >
                                    <p className="font-bold text-cyan-400 mb-1">Mode: {hoveredNode.data.mode}</p>
                                    <p className="text-gray-300">{hoveredNode.data.summary}</p>
                                    {hoveredNode.data.related_entities.length > 0 && (
                                        <p className="text-gray-500 mt-2 text-xs">
                                            Related: {hoveredNode.data.related_entities.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white font-bold text-lg pointer-events-none">
                                 {persona === 'Agent Zero' ? '0' : 'A'}
                             </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CognitiveMap;
