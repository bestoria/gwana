import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit } from 'lucide-react';
import type { MemoryFragment, Persona } from '@/src/lib/types';
import { getMemoryFragments, updateMemoryFragment, deleteMemoryFragment } from '@/src/lib/utils';

interface MemoryMatrixModalProps {
    persona: Persona;
    onClose: () => void;
}

const MemoryMatrixModal: React.FC<MemoryMatrixModalProps> = ({ persona, onClose }) => {
    const [memories, setMemories] = useState<MemoryFragment[]>([]);
    const [editingFragment, setEditingFragment] = useState<MemoryFragment | null>(null);

    useEffect(() => {
        setMemories(getMemoryFragments(persona));
    }, [persona]);

    const handleDelete = (timestamp: number) => {
        if (window.confirm("Are you sure you want to delete this memory fragment? This action cannot be undone.")) {
            deleteMemoryFragment(persona, timestamp);
            setMemories(getMemoryFragments(persona));
        }
    };

    const handleUpdate = () => {
        if (editingFragment) {
            updateMemoryFragment(persona, editingFragment);
            setMemories(getMemoryFragments(persona));
            setEditingFragment(null);
        }
    };

    const renderEditForm = () => {
        if (!editingFragment) return null;
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingFragment(null)}>
                <div className="bg-black/70 border border-[var(--border-color)] rounded-lg p-6 max-w-2xl w-full animate-fade-in" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-cyan-300 mb-4">Edit Memory Fragment</h3>
                    <div className="space-y-4 font-mono text-sm">
                        <div>
                            <label className="text-gray-400">Topic</label>
                            <input type="text" value={editingFragment.topic} onChange={e => setEditingFragment({...editingFragment, topic: e.target.value})} className="w-full bg-black/50 p-2 rounded border border-gray-600"/>
                        </div>
                        <div>
                            <label className="text-gray-400">Summary</label>
                            <textarea value={editingFragment.summary} onChange={e => setEditingFragment({...editingFragment, summary: e.target.value})} rows={3} className="w-full bg-black/50 p-2 rounded border border-gray-600"/>
                        </div>
                        <div>
                            <label className="text-gray-400">Related Entities (comma-separated)</label>
                            <input type="text" value={editingFragment.related_entities.join(', ')} onChange={e => setEditingFragment({...editingFragment, related_entities: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-black/50 p-2 rounded border border-gray-600"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setEditingFragment(null)} className="px-4 py-2 bg-gray-700 rounded-md">Cancel</button>
                        <button onClick={handleUpdate} className="px-4 py-2 bg-cyan-600 rounded-md flex items-center gap-2"><Save size={16}/> Save Changes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40 backdrop-blur-md animate-glitch-in" 
                onClick={onClose}
            >
                <div 
                    className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col font-mono" 
                    style={{ boxShadow: '0 0 20px var(--accent-cyan)'}} 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-cyan-300">Memory Matrix: {persona}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        {memories.length > 0 ? (
                            <div className="space-y-3">
                                {memories.map(mem => (
                                    <div key={mem.timestamp} className="bg-black/40 p-3 rounded-md border border-gray-700 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-cyan-400">{mem.topic}</p>
                                                <p className="text-xs text-gray-500">{new Date(mem.timestamp).toLocaleString()} | Mode: {mem.mode}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingFragment(mem)} className="p-1 text-gray-400 hover:text-white"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete(mem.timestamp)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-2">{mem.summary}</p>
                                        {mem.related_entities.length > 0 && <p className="text-xs text-gray-500 mt-1">Tags: {mem.related_entities.join(', ')}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No memories found for this persona.</div>
                        )}
                    </div>
                </div>
            </div>
            {renderEditForm()}
        </>
    );
};

export default MemoryMatrixModal;