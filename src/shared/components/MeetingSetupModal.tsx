import React, { useState } from 'react';
import { X, Mic } from 'lucide-react';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';

interface MeetingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingSetupModal: React.FC<MeetingSetupModalProps> = ({ isOpen, onClose }) => {
  const { startMeeting } = useLiveAPIContext();
  const [language, setLanguage] = useState('English');
  const [interpretation, setInterpretation] = useState(true);

  if (!isOpen) return null;

  const handleStart = () => {
    startMeeting(language, interpretation);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in"
      onClick={onClose}
    >
      <div
        className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full shadow-2xl font-mono"
        style={{ boxShadow: '0 0 20px var(--accent-cyan)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-cyan-300">Meeting Setup</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="meeting-language" className="block text-sm font-medium text-gray-300 mb-1">
              Primary Spoken Language
            </label>
            <select
              id="meeting-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option>English</option>
              <option>Hausa</option>
              <option>Arabic</option>
              <option>French</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-black/30 p-3 rounded-md">
            <label htmlFor="live-interpretation" className="text-sm font-medium text-gray-200">
              Live English Interpretation
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="live-interpretation"
                type="checkbox"
                checked={interpretation}
                onChange={(e) => setInterpretation(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors"
          >
            <Mic size={18} /> Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetupModal;