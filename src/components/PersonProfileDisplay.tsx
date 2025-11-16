import React, { useState, useEffect } from 'react';
import { User, Calendar, Loader } from 'lucide-react';
import type { PersonProfileContent } from '@/src/lib/types';
import { generatePersonImage } from '../services/geminiService';

interface PersonProfileDisplayProps {
  profile: PersonProfileContent;
}

const PersonProfileDisplay: React.FC<PersonProfileDisplayProps> = ({ profile }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(true);

    useEffect(() => {
        const generateImage = async () => {
            if (!profile.image_prompt) {
                setIsLoadingImage(false);
                return;
            }
            setIsLoadingImage(true);
            try {
                const imageResult = await generatePersonImage(profile.image_prompt);
                if (imageResult) {
                    setImageUrl(`data:${imageResult.mimeType};base64,${imageResult.data}`);
                }
            } catch (error) {
                // The service function already logs the error
            } finally {
                setIsLoadingImage(false);
            }
        };

        generateImage();
    }, [profile.image_prompt]);

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <h3 className="text-base font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <User size={18} /> {profile.name.toUpperCase()}
            </h3>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3 flex-shrink-0">
                    <div className="aspect-square bg-black/40 rounded-md border border-gray-700 flex items-center justify-center">
                        {isLoadingImage ? (
                            <Loader size={32} className="text-cyan-400 animate-spin" />
                        ) : imageUrl ? (
                            <img src={imageUrl} alt={`Portrait of ${profile.name}`} className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <p className="text-gray-500 text-center p-2">Image not available</p>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{profile.summary}</p>
                    
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><Calendar size={16} /> Key Events</h4>
                    <div className="space-y-2 text-sm">
                        {profile.timeline_events.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="font-bold text-gray-200 w-16 text-right">{item.year}</div>
                                <div className="border-l-2 border-cyan-500/50 pl-3 flex-1">
                                    <p className="text-gray-300">{item.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonProfileDisplay;
