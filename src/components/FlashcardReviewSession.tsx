import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, ArrowLeft } from 'lucide-react';
import { studyDB, FlashcardDeck, FlashcardWithSRS, SRSAlgorithm, StudySession } from '../lib/studyDB';

interface FlashcardReviewSessionProps {
  deck: FlashcardDeck;
  onExit: () => void;
}

const FlashcardReviewSession: React.FC<FlashcardReviewSessionProps> = ({ deck, onExit }) => {
  const [currentCards, setCurrentCards] = useState<FlashcardWithSRS[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    // Get due cards or all cards if none are due
    const dueCards = SRSAlgorithm.getDueCards(deck);
    setCurrentCards(dueCards.length > 0 ? dueCards : deck.cards.slice(0, 10));
  }, [deck]);

  const currentCard = currentCards[currentIndex];

  const handleRating = async (quality: number) => {
    if (!currentCard) return;

    // Update card with SRS algorithm
    const updatedCard = SRSAlgorithm.calculateNextReview(currentCard, quality);

    // Update deck
    const updatedDeck = {
      ...deck,
      lastReviewed: Date.now(),
      cards: deck.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    };
    
    await studyDB.saveDeck(updatedDeck);
    setReviewedCount(reviewedCount + 1);

    // Move to next card
    if (currentIndex < currentCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200);
    } else {
      // Session complete
      const duration = Math.round((Date.now() - sessionStartTime) / 60000);
      const session: StudySession = {
        id: `session_${Date.now()}`,
        subject: deck.subject,
        topic: deck.topic,
        startTime: sessionStartTime,
        endTime: Date.now(),
        duration,
        type: 'flashcards',
        performance: Math.round((reviewedCount / currentCards.length) * 100),
      };
      await studyDB.addSession(session);
      onExit();
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!currentCard) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black/90 text-white">
        <p className="text-xl text-cyan-400">No cards to review!</p>
        <button
          onClick={onExit}
          className="mt-4 px-6 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          Exit
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / currentCards.length) * 100;

  return (
    <div className="h-full flex flex-col bg-black/90 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/30 bg-black/50">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onExit} className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-cyan-400" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-cyan-300">{deck.topic}</h2>
            <p className="text-xs text-gray-400">
              {currentIndex + 1} / {currentCards.length}
            </p>
          </div>
          <div className="w-8"></div>
        </div>
        <div className="w-full bg-black/40 rounded-full h-2">
          <div
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          onClick={handleFlip}
          className="relative w-full max-w-2xl h-80 cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          <div
            className={`absolute inset-0 transition-transform duration-500 preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-black/60 border-2 border-cyan-500/50 rounded-xl flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-300">{currentCard.term}</p>
                {currentCard.pronunciation && (
                  <p className="text-lg text-cyan-400/70 mt-4 italic">{currentCard.pronunciation}</p>
                )}
                <p className="text-sm text-gray-400 mt-8">Tap to reveal</p>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black/60 border-2 border-magenta-500/50 rounded-xl flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-xl text-gray-200 leading-relaxed">{currentCard.definition}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Buttons */}
      {isFlipped && (
        <div className="p-6 border-t border-cyan-500/30 bg-black/50">
          <p className="text-center text-sm text-gray-400 mb-3">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleRating(1)}
              className="flex flex-col items-center gap-1 p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-red-400" />
              <span className="text-xs text-red-300">Again</span>
            </button>
            <button
              onClick={() => handleRating(3)}
              className="flex flex-col items-center gap-1 p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg transition-colors"
            >
              <RotateCcw size={20} className="text-amber-400" />
              <span className="text-xs text-amber-300">Hard</span>
            </button>
            <button
              onClick={() => handleRating(4)}
              className="flex flex-col items-center gap-1 p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-colors"
            >
              <Check size={20} className="text-cyan-400" />
              <span className="text-xs text-cyan-300">Good</span>
            </button>
            <button
              onClick={() => handleRating(5)}
              className="flex flex-col items-center gap-1 p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg transition-colors"
            >
              <Check size={20} className="text-green-400" />
              <span className="text-xs text-green-300">Easy</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default FlashcardReviewSession;
