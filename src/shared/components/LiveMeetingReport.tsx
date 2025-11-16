import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { LiveReportData } from '@/src/lib/types';
import { FileText, UserCheck, CheckSquare, Edit, Languages, MessageSquare } from 'lucide-react';
import { useLiveAPIContext } from '@/src/contexts/LiveAPIContext';

interface LiveMeetingReportProps {
  data: LiveReportData | null;
}

const SpeakerNameEditor: React.FC = () => {
    const { detectedSpeakers, speakerNames, setSpeakerNames } = useLiveAPIContext();
    const sortedSpeakers = Array.from(detectedSpeakers).sort((a: string, b: string) => {
        const numA = parseInt(a.split(' ')[1], 10);
        const numB = parseInt(b.split(' ')[1], 10);
        return numA - numB;
    });

    if (sortedSpeakers.length === 0) {
        return <p className="text-xs text-gray-500 italic px-2">No speakers detected yet.</p>;
    }

    return (
        <div className="p-2 bg-black/20 rounded-md border border-gray-700/50 space-y-2 mb-2">
            {sortedSpeakers.map(speakerId => (
                <div key={speakerId} className="flex items-center gap-2">
                    <label htmlFor={`speaker-${speakerId}`} className="text-xs text-gray-300 w-20 flex-shrink-0">{speakerId}:</label>
                    <input
                        id={`speaker-${speakerId}`}
                        type="text"
                        value={speakerNames[speakerId] || ''}
                        onChange={(e) => setSpeakerNames(prev => ({ ...prev, [speakerId as string]: e.target.value }))}
                        className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Enter name..."
                    />
                </div>
            ))}
        </div>
    );
};


const LiveMeetingReport: React.FC<LiveMeetingReportProps> = ({ data }) => {
  const { speakerNames, polishedOriginalTranscript, englishInterpretation, liveSentiment } = useLiveAPIContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'interpretation'>('summary');
  
  const summaryRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const decisionsRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLPreElement>(null);
  const interpretationRef = useRef<HTMLPreElement>(null);

  // Auto-scroll sections as new content is added
  useEffect(() => { summaryRef.current?.scrollTo(0, summaryRef.current.scrollHeight); }, [data?.summaryPoints.length]);
  useEffect(() => { actionsRef.current?.scrollTo(0, actionsRef.current.scrollHeight); }, [data?.actionItems.length]);
  useEffect(() => { decisionsRef.current?.scrollTo(0, decisionsRef.current.scrollHeight); }, [data?.keyDecisions.length]);
  useEffect(() => { transcriptRef.current?.scrollTo(0, transcriptRef.current.scrollHeight); }, [polishedOriginalTranscript]);
  useEffect(() => { interpretationRef.current?.scrollTo(0, interpretationRef.current.scrollHeight); }, [englishInterpretation]);
  
  const sentimentIndicator = useMemo(() => {
    let color = 'var(--text-secondary)';
    let title = 'Neutral Sentiment';
    if (liveSentiment === 'positive') {
      color = 'var(--accent-green)';
      title = 'Positive Sentiment';
    } else if (liveSentiment === 'negative') {
      color = '#ff0055';
      title = 'Negative Sentiment';
    }
    return <div title={title} className="w-3 h-3 rounded-full transition-colors duration-500 animate-pulse" style={{ backgroundColor: color }} />;
  }, [liveSentiment]);

  const TabButton: React.FC<{ tabId: typeof activeTab; icon: React.ElementType; label: string }> = ({ tabId, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 flex items-center justify-center gap-2 text-xs py-2 border-b-2 transition-colors ${activeTab === tabId ? 'text-cyan-300 border-cyan-300' : 'text-gray-400 border-transparent hover:text-white'}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="live-meeting-report-panel font-mono">
        <div className="flex-shrink-0">
             <h3 className="live-report-header justify-between">
                <div className="flex items-center gap-2">
                    <UserCheck size={16} /> Participants
                </div>
                <div className="flex items-center gap-3">
                  {sentimentIndicator}
                  <button onClick={() => setIsEditorOpen(prev => !prev)} className="text-cyan-400 hover:text-white p-1" title="Edit Speaker Names">
                      <Edit size={14} />
                  </button>
                </div>
            </h3>
            {isEditorOpen && <SpeakerNameEditor />}
        </div>
        
        <div className="flex border-b border-cyan-500/20 mb-2 flex-shrink-0">
            <TabButton tabId="summary" icon={FileText} label="Summary" />
            <TabButton tabId="transcript" icon={MessageSquare} label="Transcript" />
            <TabButton tabId="interpretation" icon={Languages} label="Interpretation" />
        </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="flex-1 overflow-y-auto space-y-2">
            <div ref={summaryRef} className="live-report-section max-h-full">
                <h3 className="live-report-header"><FileText size={16} /> Summary</h3>
                <ul className="live-report-list">
                    {data?.summaryPoints.map((point, index) => <li key={`sum-${index}`}>{point}</li>)}
                    {!data?.summaryPoints.length && <li className="text-gray-500 text-xs italic">Awaiting key points...</li>}
                </ul>
            </div>
            <div ref={actionsRef} className="live-report-section max-h-full">
                <h3 className="live-report-header"><UserCheck size={16} /> Action Items</h3>
                <ul className="live-report-list">
                    {data?.actionItems.map((item, index) => <li key={`act-${index}`}><strong>{speakerNames[item.assignee] || item.assignee}:</strong> {item.task}</li>)}
                    {!data?.actionItems.length && <li className="text-gray-500 text-xs italic">Awaiting action items...</li>}
                </ul>
            </div>
            <div ref={decisionsRef} className="live-report-section max-h-full">
                <h3 className="live-report-header"><CheckSquare size={16} /> Key Decisions</h3>
                <ul className="live-report-list">
                    {data?.keyDecisions.map((decision, index) => <li key={`dec-${index}`}>{decision}</li>)}
                    {!data?.keyDecisions.length && <li className="text-gray-500 text-xs italic">Awaiting key decisions...</li>}
                </ul>
            </div>
        </div>
      )}

      {/* Transcript Tab */}
      {activeTab === 'transcript' && (
        <div className="flex-1 overflow-y-auto">
            <pre ref={transcriptRef} className="h-full w-full whitespace-pre-wrap text-gray-200 text-sm">
                {polishedOriginalTranscript || "Awaiting transcript..."}
            </pre>
        </div>
      )}

      {/* Interpretation Tab */}
      {activeTab === 'interpretation' && (
        <div className="flex-1 overflow-y-auto">
            <pre ref={interpretationRef} className="h-full w-full whitespace-pre-wrap text-gray-200 text-sm">
                {englishInterpretation || "Awaiting interpretation..."}
            </pre>
        </div>
      )}
    </div>
  );
};

export default LiveMeetingReport;