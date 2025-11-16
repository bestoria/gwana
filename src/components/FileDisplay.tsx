import React from 'react';
import { FileText, Download, FileArchive, FileJson, FileCode } from 'lucide-react';

interface FileDisplayProps {
  fileName: string;
  fileSize: string;
  fileType: string; // e.g., 'pdf', 'zip', 'json'
}

const FileDisplay: React.FC<FileDisplayProps> = ({ fileName, fileSize, fileType }) => {
  
  const getFileIcon = () => {
    const type = (fileType || '').toLowerCase();
    const name = (fileName || '').toLowerCase();

    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText size={32} className="text-red-400" />;
    }
    if (type.includes('wordprocessingml') || name.endsWith('.docx')) {
      return <FileText size={32} className="text-blue-400" />;
    }
    if (type.includes('zip') || ['.zip', '.rar', '.7z'].some(ext => name.endsWith(ext))) {
      return <FileArchive size={32} className="text-purple-400" />;
    }
    if (type.includes('json') || name.endsWith('.json')) {
      return <FileJson size={32} className="text-yellow-400" />;
    }
    if (['javascript', 'typescript', 'python', 'html'].some(lang => type.includes(lang)) || ['.js', '.ts', '.py', '.html'].some(ext => name.endsWith(ext))) {
        return <FileCode size={32} className="text-blue-400" />;
    }
    
    return <FileText size={32} className="text-gray-400" />;
  };

  const handleDownload = () => {
    // In a real app, this would trigger a download from a URL.
    // For now, it's a placeholder.
    alert(`Downloading ${fileName}... (simulation)`);
  };

  return (
    <div className="mt-2 flex items-center gap-3 bg-black/30 border border-cyan-500/30 rounded-lg p-3 my-2 max-w-sm">
      <div className="flex-shrink-0">
        {getFileIcon()}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-white font-semibold truncate font-mono">{fileName}</p>
        <p className="text-xs text-gray-400 font-mono">{fileSize}</p>
      </div>
      <button 
        onClick={handleDownload}
        className="p-2 bg-cyan-900/50 rounded-full text-cyan-300 hover:bg-cyan-800 hover:text-white transition-colors"
        aria-label={`Download ${fileName}`}
      >
        <Download size={20} />
      </button>
    </div>
  );
};

export default FileDisplay;