import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="mt-2 bg-black/50 border border-cyan-500/30 rounded-md overflow-hidden font-mono text-sm my-2">
      <div className="flex items-center justify-between bg-gray-900/70 px-4 py-2">
        <span className="text-cyan-400 font-semibold tracking-wider">{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
        {isCopied ? (
          <Check size={16} style={{ color: 'var(--accent-green)' }} />
        ) : (
          <Copy size={16} />
        )}
          <span className="text-xs">{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-gray-200">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
