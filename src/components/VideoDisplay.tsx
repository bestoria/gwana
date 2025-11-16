import React from 'react';
import { Film, AlertTriangle, Loader } from 'lucide-react';
import type { VideoContent } from '@/src/lib/types';

interface VideoDisplayProps {
  video: VideoContent;
}

const loadingMessages = [
    "Initializing hyper-render sequence...",
    "Compiling photonic streams...",
    "Assembling reality matrix...",
    "Synchronizing quantum timelines...",
    "Rendering alternate futures...",
    "Please stand by. This may take a few minutes."
];

const VideoDisplay: React.FC<VideoDisplayProps> = ({ video }) => {
    const [currentMessage, setCurrentMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        if (video.status === 'generating') {
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setCurrentMessage(loadingMessages[i]);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [video.status]);

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Film size={16} /> VIDEO GENERATION
            </h3>
            <div className="p-2 bg-black/40 rounded-md border border-gray-700">
                <p className="text-gray-300 italic">Prompt: "{video.prompt}"</p>
            </div>
            
            <div className="mt-3">
                {video.status === 'generating' && (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Loader size={32} className="text-cyan-400 animate-spin mb-4" />
                        <p className="text-cyan-300 text-sm font-semibold transition-opacity duration-500">{currentMessage}</p>
                    </div>
                )}
                {video.status === 'complete' && video.downloadUrl && (
                    <div>
                        <video controls src={video.downloadUrl} className="w-full rounded-md" />
                    </div>
                )}
                {video.status === 'error' && (
                     <div className="flex items-center gap-3 p-4 bg-red-900/50 text-red-300 rounded-md">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="font-bold">Generation Failed</p>
                            <p className="text-xs">{video.errorMessage || "An unknown error occurred."}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoDisplay;