import React, { useState } from 'react';
import { Key } from 'lucide-react';

const ApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsOpen(false);
      window.location.reload();
    }
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <>
      {/* Subtle invisible button - only visible on hover */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 w-3 h-3 rounded-full bg-border/5 hover:bg-border/20 transition-all duration-300 opacity-20 hover:opacity-100 z-50"
        aria-label="API Key"
      />

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setIsOpen(false)}>
          <div className="glass-panel w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">API Key</h3>
            </div>
            
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Google Gemini API Key"
              className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              {localStorage.getItem('gemini_api_key') && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyInput;
