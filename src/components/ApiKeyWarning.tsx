import React from 'react';
import { ShieldAlert } from 'lucide-react';

const ApiKeyWarning: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4 text-white">
      <div className="text-center bg-black/30 backdrop-blur-md border border-red-500/50 p-8 rounded-lg shadow-2xl max-w-md animate-fade-in"
           style={{ boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}>
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-800 rounded-full mx-auto mb-4 flex items-center justify-center ring-4 ring-red-500/30">
          <ShieldAlert className="text-white" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 0 5px rgba(255, 255, 255, 0.7)' }}>SYSTEM OFFLINE</h2>
        <p className="text-gray-300">
          A critical configuration error has been detected. The connection key <code className="bg-red-900/50 text-red-300 px-1 rounded-sm">API_KEY</code> is not authenticated.
        </p>
        <p className="text-gray-400 mt-4 text-sm">
          Ensure the <code className="bg-gray-700/50 text-gray-300 px-1 rounded-sm">process.env.API_KEY</code> environment variable is correctly provisioned by the system administrator to restore functionality.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyWarning;