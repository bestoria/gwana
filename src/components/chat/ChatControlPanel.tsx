import React, { useState } from 'react';
import { Settings, Zap, Brain, FileText, Image, Code, Share2, Archive, Sliders, Globe, MessageSquare, Sparkles } from 'lucide-react';
import NeonButton from '../cyberpunk/NeonButton';
import type { AiMode, Persona } from '@/src/lib/types';
import { AI_MODES } from '@/src/lib/constants';

interface ChatControlPanelProps {
  aiMode: AiMode;
  persona: Persona;
  onModeChange: (mode: AiMode) => void;
  onPersonaChange: (persona: Persona) => void;
  onGenerateImage: () => void;
  onCreateDiagram: () => void;
  onSummarize: () => void;
  onExport: () => void;
}

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Explain this simply', category: 'explain' },
  { icon: '✍️', text: 'Write an email', category: 'write' },
  { icon: '🔍', text: 'Research this topic', category: 'research' },
  { icon: '📊', text: 'Create a table', category: 'format' },
  { icon: '🎨', text: 'Generate an image', category: 'create' },
  { icon: '💻', text: 'Write code for this', category: 'code' },
  { icon: '📝', text: 'Summarize above', category: 'summarize' },
  { icon: '🌐', text: 'Search the web', category: 'search' },
];

const ChatControlPanel: React.FC<ChatControlPanelProps> = ({
  aiMode,
  persona,
  onModeChange,
  onPersonaChange,
  onGenerateImage,
  onCreateDiagram,
  onSummarize,
  onExport
}) => {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [responseFormat, setResponseFormat] = useState<'concise' | 'detailed' | 'creative'>('detailed');
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [enableImageGen, setEnableImageGen] = useState(true);

  return (
    <div className="space-y-4">
      {/* AI Mode Selector */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Brain size={12} />
          AI MODE
        </div>
        <select
          value={aiMode}
          onChange={(e) => onModeChange(e.target.value as AiMode)}
          className="w-full bg-black/50 border border-gray-700 focus:border-cyan-400 rounded px-2 py-2 text-xs text-cyan-300 font-mono outline-none"
        >
          {AI_MODES.map(modeItem => (
            <option key={modeItem.mode} value={modeItem.mode}>
              {modeItem.icon} {modeItem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Persona Selector */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <MessageSquare size={12} />
          PERSONA
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPersonaChange('Agent Zero')}
            className={`p-2 rounded text-xs font-mono border transition-all ${
              persona === 'Agent Zero'
                ? 'bg-blue-400/30 border-blue-400 text-blue-300'
                : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            👨 Zero
            <div className="text-[9px] text-gray-500">Professional</div>
          </button>
          <button
            onClick={() => onPersonaChange('Agent Zara')}
            className={`p-2 rounded text-xs font-mono border transition-all ${
              persona === 'Agent Zara'
                ? 'bg-pink-400/30 border-pink-400 text-pink-300'
                : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            👩 Zara
            <div className="text-[9px] text-gray-500">Friendly</div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Zap size={12} />
          QUICK ACTIONS
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NeonButton
            onClick={onSummarize}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <FileText size={12} />
            Summarize
          </NeonButton>
          <NeonButton
            onClick={onGenerateImage}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Image size={12} />
            Image
          </NeonButton>
          <NeonButton
            onClick={onCreateDiagram}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Code size={12} />
            Diagram
          </NeonButton>
          <NeonButton
            onClick={onExport}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Share2 size={12} />
            Export
          </NeonButton>
        </div>
      </div>

      {/* Quick Prompts Library */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md max-h-[250px] overflow-y-auto">
        <div className="text-xs text-cyan-300 font-mono mb-2 flex items-center gap-1">
          <Sparkles size={12} />
          QUICK PROMPTS
        </div>
        <div className="space-y-1">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              className="w-full bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-xs text-left text-gray-300 hover:text-cyan-300 transition-all flex items-center gap-2"
            >
              <span className="text-base">{prompt.icon}</span>
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2">CAPABILITIES</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Globe size={10} />
              WEB SEARCH
            </span>
            <button
              onClick={() => setEnableWebSearch(!enableWebSearch)}
              className={`w-10 h-5 rounded-full border transition-all ${
                enableWebSearch
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-black/30 border-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-cyan-300 transition-transform ${
                enableWebSearch ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Image size={10} />
              IMAGE GEN
            </span>
            <button
              onClick={() => setEnableImageGen(!enableImageGen)}
              className={`w-10 h-5 rounded-full border transition-all ${
                enableImageGen
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-black/30 border-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-cyan-300 transition-transform ${
                enableImageGen ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Model Settings */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-3 flex items-center gap-1">
          <Sliders size={12} />
          MODEL SETTINGS
        </div>
        
        <div className="space-y-3">
          {/* Temperature */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">
              TEMPERATURE: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">
              MAX TOKENS: {maxTokens}
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Response Format */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">RESPONSE FORMAT</label>
            <div className="grid grid-cols-3 gap-1">
              {(['concise', 'detailed', 'creative'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setResponseFormat(format)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    responseFormat === format
                      ? 'bg-cyan-400/30 border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border-gray-700 text-gray-400'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context & Memory */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2">ACTIVE CONTEXT</div>
        <div className="space-y-1 text-[10px] text-gray-400">
          <div className="flex justify-between">
            <span>Files attached:</span>
            <span className="text-cyan-300">0</span>
          </div>
          <div className="flex justify-between">
            <span>Images in context:</span>
            <span className="text-cyan-300">0</span>
          </div>
          <div className="flex justify-between">
            <span>Memory items:</span>
            <span className="text-cyan-300">5</span>
          </div>
        </div>
        <button className="w-full mt-2 bg-black/50 border border-gray-700 hover:border-cyan-400 p-2 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all">
          Manage Context
        </button>
      </div>

      {/* Conversation Stats */}
      <div className="bg-black/40 border border-[var(--border-color)] p-3 rounded-md">
        <div className="text-xs text-cyan-300 font-mono mb-2">SESSION STATS</div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-cyan-300">24</div>
            <div className="text-[10px] text-gray-400">MESSAGES</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-300">8</div>
            <div className="text-[10px] text-gray-400">MIN ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatControlPanel;
