import React, { useMemo } from 'react';
import { MapPin, Info } from 'lucide-react';
import type { PlaceProfileContent } from '@/src/lib/types';

interface PlaceProfileDisplayProps {
  profile: PlaceProfileContent;
}

const PlaceProfileDisplay: React.FC<PlaceProfileDisplayProps> = ({ profile }) => {

    const mapSrc = useMemo(() => {
        if (!profile.coordinates || !process.env.API_KEY) return '';
        const { lat, lng } = profile.coordinates;
        // Use Google Maps Embed API
        return `https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${lat},${lng}&zoom=14&maptype=satellite`;
    }, [profile.coordinates]);

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <h3 className="text-base font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <MapPin size={18} /> {profile.name.toUpperCase()}
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{profile.summary}</p>
                    
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><Info size={16} /> Key Facts</h4>
                    <div className="space-y-1 text-sm">
                        {profile.key_facts.map((fact, index) => (
                            <div key={index} className="flex justify-between p-1 bg-black/20 rounded">
                                <span className="text-gray-400">{fact.label}:</span>
                                <span className="font-semibold text-white">{fact.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-2/5 flex-shrink-0">
                    {mapSrc ? (
                        <iframe
                            className="w-full h-64 md:h-full rounded-md border border-gray-700"
                            loading="lazy"
                            allowFullScreen
                            src={mapSrc}>
                        </iframe>
                    ) : (
                        <div className="w-full h-64 md:h-full rounded-md border border-gray-700 bg-black/40 flex items-center justify-center">
                            <p className="text-gray-500">Map data not available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaceProfileDisplay;