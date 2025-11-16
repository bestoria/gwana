import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Brain, Volume2, Download, Upload, Sparkles } from 'lucide-react';
import { studyDB, FlashcardDeck, FlashcardWithSRS, SRSAlgorithm } from '../lib/studyDB';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

interface FlashcardManagerProps {
  onStartReview: (deck: FlashcardDeck) => void;
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({ onStartReview }) => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const { startFlashcardAudioReview } = useLiveAPIContext();

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      await studyDB.init();
      const allDecks = await studyDB.getAllDecks();
      setDecks(allDecks);
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const generateFlashcards = async () => {
    if (!subject.trim() || !topic.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ subject, topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      
      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        subject,
        topic,
        createdAt: Date.now(),
        cards: data.flashcards.map((card: any, idx: number) => ({
          id: `card_${Date.now()}_${idx}`,
          term: card.term,
          definition: card.definition,
          pronunciation: card.pronunciation,
          repetition: 0,
          easeFactor: 2.5,
          interval: 0,
          dueDate: Date.now(),
          correctCount: 0,
          incorrectCount: 0,
        })),
      };

      await studyDB.saveDeck(newDeck);
      setDecks([...decks, newDeck]);
      setShowCreateDialog(false);
      setSubject('');
      setTopic('');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const deleteDeck = async (id: string) => {
    if (!confirm('Delete this deck?')) return;
    await studyDB.deleteDeck(id);
    setDecks(decks.filter((d) => d.id !== id));
  };

  const getDueCount = (deck: FlashcardDeck) => {
    return SRSAlgorithm.getDueCards(deck).length;
  };

  const startAudioReview = (deck: FlashcardDeck) => {
    const dueCards = SRSAlgorithm.getDueCards(deck);
    if (dueCards.length === 0) {
      alert('No cards due for review!');
      return;
    }
    // Convert to format expected by LiveAPI
    const cards = dueCards.map(c => ({
      term: c.term,
      definition: c.definition,
      pronunciation: c.pronunciation,
    }));
    startFlashcardAudioReview(cards);
  };

  return (
    <div className="h-full flex flex-col bg-black/90 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-black/50">
        <div className="flex items-center gap-2">
          <Brain size={24} className="text-cyan-400" />
          <h1 className="text-xl font-semibold text-cyan-400">Flashcard Decks</h1>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Create Deck</span>
        </button>
      </div>

      {/* Decks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {decks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <Brain size={64} className="mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-gray-400">No Flashcard Decks Yet</h2>
            <p className="max-w-sm mt-2">Create your first deck with AI-generated flashcards</p>
          </div>
        ) : (
          decks.map((deck) => {
            const dueCount = getDueCount(deck);
            const weakCards = SRSAlgorithm.getWeakCards(deck);
            
            return (
              <div
                key={deck.id}
                className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300">{deck.topic}</h3>
                    <p className="text-sm text-gray-400">{deck.subject}</p>
                  </div>
                  <button
                    onClick={() => deleteDeck(deck.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-cyan-300 font-bold">{deck.cards.length}</div>
                    <div className="text-gray-500 text-xs">Total</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-amber-300 font-bold">{dueCount}</div>
                    <div className="text-gray-500 text-xs">Due</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-red-300 font-bold">{weakCards.length}</div>
                    <div className="text-gray-500 text-xs">Weak</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onStartReview(deck)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-colors"
                  >
                    <Brain size={16} />
                    <span>Review</span>
                  </button>
                  <button
                    onClick={() => startAudioReview(deck)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-cyan-500/50 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={24} className="text-cyan-400" />
              <h2 className="text-xl font-semibold text-cyan-400">Generate Flashcards</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, History, Biology"
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quadratic Equations, World War II"
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generateFlashcards}
                  disabled={generating || !subject.trim() || !topic.trim()}
                  className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;
