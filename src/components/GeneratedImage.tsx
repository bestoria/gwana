import React, { useState, useEffect } from 'react';
import { X, Download, Maximize } from 'lucide-react';

const ImageModal: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = blob.type.split('/')[1] || 'png';
            link.download = `kwararru-generated-${Date.now()}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback to original method for browsers that might have issues with fetch on data URIs
            const link = document.createElement('a');
            link.href = src;
            link.download = `kwararru-generated-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="relative max-w-[90vw] max-h-[90vh] bg-black/50 border border-cyan-500/50 p-2 rounded-lg shadow-2xl flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={src} alt="Generated content in full view" className="max-w-full max-h-full object-contain rounded" />
                
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition-colors shadow-lg"
                        title="Download Image"
                        aria-label="Download Image"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"
                        title="Close"
                        aria-label="Close image viewer"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};


const GeneratedImage: React.FC<{ src: string }> = ({ src }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setIsRendered(true);
                    return 100;
                }
                return p + 2;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [src]);
    
    const handleOpenModal = () => {
        if (isRendered) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="mt-2 p-2 border border-cyan-500/50 bg-black/30 relative font-mono text-xs max-w-sm">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
                
                {!isRendered && (
                    <div className="p-4 text-center">
                        <p className="text-cyan-300 animate-pulse">DECODING IMAGE TRANSMISSION...</p>
                        <div className="w-full bg-gray-700 h-2 mt-2 border border-gray-600">
                            <div className="bg-cyan-400 h-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
                        </div>
                        <p className="text-gray-400 mt-1">{progress}%</p>
                    </div>
                )}
                
                <button 
                    className={`relative overflow-hidden transition-opacity duration-500 ${isRendered ? 'opacity-100 cursor-pointer' : 'opacity-0 h-0'} w-full block text-left group`}
                    onClick={handleOpenModal}
                    disabled={!isRendered}
                    aria-label="View generated image in full screen"
                >
                    <img src={src} alt="Generated content" className="block w-full h-auto" />
                    <div className="absolute inset-0 scanlines" style={{ zIndex: 1, pointerEvents: 'none' }}></div>
                    <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white font-bold text-sm tracking-widest border-2 border-white rounded-full p-3 bg-black/50">
                            <Maximize size={24} />
                        </span>
                    </div>
                </button>
            </div>

            {isModalOpen && <ImageModal src={src} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default GeneratedImage;