import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Layers, Volume2 } from 'lucide-react';
import type { FlashcardContent, Flashcard } from '@/src/lib/types';

interface FlashcardDisplayProps {
  flashcards: FlashcardContent;
  onUpdateSRS: (deckId: string, updatedCards: Flashcard[]) => void;
  startAudioReview: (cards: Flashcard[]) => void;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ flashcards, onUpdateSRS, startAudioReview }) => {
    const [shuffledCards, setShuffledCards] = useState([...flashcards.flashcards]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        // Initial shuffle on component mount
        setShuffledCards(prev => [...prev].sort(() => Math.random() - 0.5));
    }, [flashcards]);

    const currentCard = useMemo(() => shuffledCards[currentIndex], [shuffledCards, currentIndex]);

    const handleNext = () => {
        setIsFlipped(false);
        // Use a timeout to allow the flip animation to complete before changing content
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
        }, 150);
    };

    const handleShuffle = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setShuffledCards(prev => [...prev].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
        }, 150);
    };

    if (!flashcards || flashcards.flashcards.length === 0) return null;

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><Layers size={16} /> FLASHCARDS: {flashcards.topic.toUpperCase()}</span>
                <span className="text-gray-400 text-xs">Card {currentIndex + 1} / {shuffledCards.length}</span>
            </h3>

            <div 
                className="w-full h-48 bg-black/40 rounded-md border border-gray-700 flex items-center justify-center p-4 text-center cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute w-full h-full flex items-center justify-center backface-hidden">
                        <p className="text-lg text-gray-100 font-bold">{currentCard?.term}</p>
                    </div>
                    {/* Back */}
                     <div className="absolute w-full h-full flex flex-col items-center justify-center backface-hidden rotate-y-180 p-4">
                        {currentCard?.pronunciation && <p className="text-lg text-cyan-300 mb-2 font-sans">{currentCard.pronunciation}</p>}
                        <p className="text-base text-gray-300 leading-relaxed">{currentCard?.definition}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
                <button onClick={handlePrev} className="p-2 bg-cyan-900/50 hover:bg-cyan-800 rounded-full text-cyan-300" title="Previous Card">
                    <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                     <button onClick={() => startAudioReview(shuffledCards)} className="flex items-center gap-2 px-3 py-2 bg-blue-900/50 text-blue-300 rounded-md text-sm" title="Start Audio Review Session">
                        <Volume2 size={14} /> Review Audio
                    </button>
                    <button onClick={handleShuffle} className="flex items-center gap-2 px-3 py-2 bg-cyan-900/50 text-cyan-300 rounded-md text-sm" title="Shuffle Deck">
                        <RefreshCw size={14} /> Shuffle
                    </button>
                    <button onClick={() => setIsFlipped(!isFlipped)} className="flex items-center gap-2 px-4 py-2 bg-cyan-900/50 text-cyan-300 rounded-md text-sm" title="Flip Card">
                        Flip
                    </button>
                </div>

                <button onClick={handleNext} className="p-2 bg-cyan-900/50 hover:bg-cyan-800 rounded-full text-cyan-300" title="Next Card">
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Simple CSS for the flip animation */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default FlashcardDisplay;