import React, { useState, useRef, MouseEvent } from 'react';
import type { WhiteboardElement, WhiteboardPath } from '@/src/lib/types';
import { Trash2, Pen, Droplet } from 'lucide-react';

interface WhiteboardCanvasProps {
    elements: WhiteboardElement[];
    onUserDraw: (element: WhiteboardPath) => void;
    onClear: () => void;
}

const WhiteboardToolbar: React.FC<{
    color: string;
    setColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    onClear: () => void;
}> = ({ color, setColor, strokeWidth, setStrokeWidth, onClear }) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md border border-[var(--border-color)] rounded-lg p-2 flex items-center gap-4 z-10 shadow-lg">
            <div className="flex items-center gap-2" title="Color">
                <Droplet size={20} className="text-gray-300"/>
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer"
                />
            </div>
            <div className="flex items-center gap-2" title="Stroke Width">
                <Pen size={20} className="text-gray-300"/>
                <input 
                    type="range" 
                    min="2" 
                    max="20" 
                    value={strokeWidth} 
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-24 cursor-pointer"
                />
            </div>
            <button onClick={onClear} className="p-2 text-gray-300 hover:text-red-400 transition-colors" title="Clear Canvas">
                <Trash2 size={20} />
            </button>
        </div>
    );
};

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ elements, onUserDraw, onClear }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [color, setColor] = useState('#00ffff');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const svgRef = useRef<SVGSVGElement>(null);

    const getCoordinates = (event: MouseEvent<SVGSVGElement>): { x: number; y: number } => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        return {
            x: (event.clientX - CTM.e) / CTM.a,
            y: (event.clientY - CTM.f) / CTM.d,
        };
    };

    const handleMouseDown = (e: MouseEvent<SVGSVGElement>) => {
        const { x, y } = getCoordinates(e);
        setCurrentPath(`M ${x} ${y}`);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        setCurrentPath(prev => `${prev} L ${x} ${y}`);
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentPath.includes('L')) {
            // Don't add empty paths or single dots
            setIsDrawing(false);
            setCurrentPath('');
            return;
        }
        const newPath: WhiteboardPath = {
            type: 'path',
            d: currentPath,
            stroke: color,
            strokeWidth: strokeWidth,
        };
        onUserDraw(newPath);
        setIsDrawing(false);
        setCurrentPath('');
    };

    const renderElement = (element: WhiteboardElement, index: number) => {
        const props = {
            key: index,
            fill: element.fill || 'none',
            stroke: element.stroke || '#FFFFFF',
            strokeWidth: element.strokeWidth || 2,
        };

        switch (element.type) {
            case 'path':
                return <path {...props} d={element.d} />;
            case 'circle':
                return <circle {...props} cx={element.cx} cy={element.cy} r={element.r} />;
            case 'rect':
                return <rect {...props} x={element.x} y={element.y} width={element.width} height={element.height} />;
            case 'text':
                return <text {...props} x={element.x} y={element.y} fontSize={element.fontSize || 24} fontFamily={element.fontFamily || 'monospace'} fill={element.fill || '#FFFFFF'} stroke="none">{element.text}</text>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full bg-black/30 relative border border-cyan-800/50 rounded-lg overflow-hidden">
            <WhiteboardToolbar 
                color={color} 
                setColor={setColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                onClear={onClear}
            />
            <svg
                ref={svgRef}
                className="w-full h-full cursor-crosshair"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="xMidYMid meet"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Grid background */}
                <defs>
                    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 255, 255, 0.1)" strokeWidth="1"/>
                    </pattern>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <rect width="100" height="100" fill="url(#smallGrid)"/>
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="2"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {elements.map(renderElement)}
                {isDrawing && currentPath && (
                    <path
                        d={currentPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
            </svg>
        </div>
    );
};

export default WhiteboardCanvas;
