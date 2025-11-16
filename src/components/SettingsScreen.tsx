import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Palette, Zap, BarChart3, Keyboard, Download, Trash2, Phone, ChevronsRight, BrainCircuit, Share2, Brain, X, User, LogOut, LogIn, Check, BookOpen, Briefcase, DollarSign, Bot, Play, Clock, Inbox, ShieldCheck } from 'lucide-react';
import type { Settings, CallRecord, View, MemoryFragment, Workflow, WeeklyTrigger, UserProfile, Persona } from '@/src/lib/types';
import { formatTime, audioManager, getMemoryFragments } from '@/src/lib/utils';
import { Logo } from './Logo';
import MemoryMatrixModal from './MemoryMatrixModal';
import CognitiveMap from './CognitiveMap';

const Toggle = ({ checked, onChange, ariaLabel }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, ariaLabel: string }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" aria-label={ariaLabel} />
      <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
);

// --- ORIGINAL SETTINGS COMPONENT ---

interface SettingsScreenProps {
  currentUser: UserProfile | null;
  logout: () => void;
  persona: Persona;
  settings: Settings;
  callHistory: CallRecord[];
  updateSettings: (key: keyof Settings, value: any) => void;
  clearChat: () => void;
  exportChat: () => void;
  setView: (view: View) => void;
  setShowStatsModal: (show: boolean) => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
  togglePersona: () => void;
  isDesktop?: boolean;
  onBack?: () => void;
  workflows: Workflow[];
  onOpenWorkflowEditor: (workflow?: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  onToggleWorkflow: (workflowId: string, isEnabled: boolean) => void;
  setShowSubscriptionModal: (show: boolean) => void;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  ariaLabel?: string;
}
const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  children,
  ariaLabel 
}) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={onChange} 
      aria-label={ariaLabel}
      className="appearance-none w-full px-3 py-1 border border-[var(--border-color)] rounded-sm bg-black/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] cursor-pointer"
    >
      {children}
    </select>
    <ChevronsRight size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none rotate-90" />
  </div>
);

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}
const SettingsCard: React.FC<SettingsCardProps> = ({ children, className = "" }) => (
  <div className={`bg-black/30 border border-[var(--border-color)] p-4 mb-2 rounded-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
    <Icon size={16} /> {title}
  </h3>
);

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}
const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-200">{label}</span>
    {children}
  </div>
);

const getTriggerText = (workflow: Workflow) => {
    if (workflow.trigger.type === 'manual') return 'Manual';
    if (!workflow.isEnabled) return 'Disabled';

    switch(workflow.trigger.type) {
        case 'daily':
            return `Daily at ${workflow.trigger.time}`;
        case 'weekly':
            const days = workflow.trigger.days.sort().map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
            return `Weekly at ${workflow.trigger.time} on ${days}`;
        case 'once':
            return `Once on ${new Date(workflow.trigger.datetime).toLocaleString()}`;
    }
    return 'Scheduled';
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  logout,
  persona,
  settings,
  callHistory,
  updateSettings,
  clearChat,
  exportChat,
  setView,
  setShowStatsModal,
  setShowKeyboardShortcuts,
  togglePersona,
  isDesktop = false,
  onBack,
  workflows,
  onOpenWorkflowEditor,
  onDeleteWorkflow,
  onRunWorkflow,
  onToggleWorkflow,
  setShowSubscriptionModal,
}) => {
  const [showCognitiveMap, setShowCognitiveMap] = useState(false);
  const [showMemoryMatrix, setShowMemoryMatrix] = useState(false);

  const isSubscribed = currentUser?.subscription.isActive && currentUser.subscription.expiresAt && currentUser.subscription.expiresAt > Date.now();
  
  return (
    <>
    {showCognitiveMap && (
        <CognitiveMap persona={persona} onClose={() => setShowCognitiveMap(false)} />
    )}
    {showMemoryMatrix && (
        <MemoryMatrixModal persona={persona} onClose={() => setShowMemoryMatrix(false)} />
    )}
    <div className="flex-1 bg-transparent text-white flex flex-col font-mono">
      <div className="flex-1 overflow-y-auto p-2">
        <SettingsCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-cyan-500">
                    <User size={32} className="text-cyan-300" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{currentUser?.name || 'Guest'}</h2>
                    <p className="text-sm text-gray-400">{currentUser?.phone || 'No account'}</p>
                </div>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-900/50 border border-red-700 text-red-300 rounded-md hover:bg-red-800 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </SettingsCard>

        <SettingsCard>
            <SectionHeader icon={ShieldCheck} title="SUBSCRIPTION" />
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-gray-300">Status</span>
                    {isSubscribed ? (
                        <>
                            <p className="text-lg font-bold text-green-400">Active</p>
                            <p className="text-xs text-gray-400">Plan: <span className="capitalize">{currentUser?.subscription.plan}</span></p>
                            <p className="text-xs text-gray-400">Expires on {new Date(currentUser?.subscription.expiresAt!).toLocaleDateString()}</p>
                        </>
                    ) : (
                        <p className="text-lg font-bold text-red-400">Expired</p>
                    )}
                </div>
                <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors flex items-center gap-2"
                >
                    Manage
                </button>
            </div>
        </SettingsCard>

        <SettingsCard>
            <SectionHeader icon={Bot} title="WORKFLOW AUTOMATION" />
            <div className="space-y-2">
                {workflows.length > 0 ? workflows.map(wf => (
                    <div key={wf.id} className="bg-black/40 p-2 rounded-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-gray-200">{wf.name}</span>
                                {wf.trigger.type !== 'manual' && (
                                    <p className={`text-xs flex items-center gap-1 ${wf.isEnabled ? 'text-cyan-400' : 'text-gray-500'}`}>
                                        <Clock size={12} /> {getTriggerText(wf)}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {wf.trigger.type !== 'manual' && <Toggle checked={wf.isEnabled ?? false} onChange={(e) => onToggleWorkflow(wf.id, e.target.checked)} ariaLabel="Toggle Workflow Automation" />}
                                <button onClick={() => onRunWorkflow(wf.id)} title="Run Workflow" className="p-2 text-green-400 hover:bg-green-900/50 rounded-full"><Play size={16} /></button>
                                <button onClick={() => onOpenWorkflowEditor(wf)} title="Edit Workflow" className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-full"><ChevronsRight size={16} /></button>
                                <button onClick={() => onDeleteWorkflow(wf.id)} title="Delete Workflow" className="p-2 text-red-500 hover:bg-red-900/50 rounded-full"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-sm text-center text-gray-500 py-2">No workflows created yet.</p>}
            </div>
            <button 
                onClick={() => onOpenWorkflowEditor()}
                className="w-full mt-3 px-3 py-2 text-sm bg-cyan-900/50 border border-cyan-700 rounded-md hover:bg-cyan-800 text-cyan-300 transition-colors"
            >
                Create New Workflow
            </button>
        </SettingsCard>

        <SettingsCard>
          <SectionHeader icon={Palette} title="VISUALS" />
          <div className="space-y-3">
            <SettingRow label="Theme">
              <Select 
                value={settings.theme} 
                onChange={(e) => updateSettings('theme', e.target.value)}
                ariaLabel="Select theme"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">System</option>
              </Select>
            </SettingRow>
            <SettingRow label="Font Size">
              <Select 
                value={settings.fontSize} 
                onChange={(e) => updateSettings('fontSize', e.target.value)}
                ariaLabel="Select font size"
              >
                <option value="small">Compact</option>
                <option value="medium">Standard</option>
                <option value="large">Enlarged</option>
              </Select>
            </SettingRow>
          </div>
        </SettingsCard>
        
        <SettingsCard>
          <SectionHeader icon={Zap} title="AI CORE" />
          <div className="space-y-3">
            <SettingRow label="Active Consciousness">
              <button
                onClick={() => { togglePersona(); audioManager.playSound('click'); }}
                className="px-3 py-1 text-sm bg-cyan-900/50 border border-cyan-700 rounded-sm hover:bg-cyan-800 text-cyan-300 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                Switch to {persona === 'Agent Zero' ? 'Agent Zara' : 'Agent Zero'}
              </button>
            </SettingRow>
             <SettingRow label="Predictive Text">
              <Toggle
                checked={settings.predictiveText}
                onChange={(e) => updateSettings('predictiveText', e.target.checked)}
                ariaLabel="Toggle predictive text"
              />
            </SettingRow>
            <SettingRow label="Personality Matrix">
              <Select 
                value={settings.personality} 
                onChange={(e) => updateSettings('personality', e.target.value)}
                ariaLabel="Select AI personality"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </Select>
            </SettingRow>
            <SettingRow label="Vocal Synthesizer">
              <Select 
                value={settings.voiceName} 
                onChange={(e) => updateSettings('voiceName', e.target.value)}
                ariaLabel="Select AI voice"
              >
                <option value="Zephyr">Zephyr</option>
                <option value="Puck">Puck</option>
                <option value="Charon">Charon</option>
                <option value="Kore">Kore (Agent Zara)</option>
                <option value="Algieba">Algieba (Agent Zero)</option>
              </Select>
            </SettingRow>
          </div>
        </SettingsCard>

        <SettingsCard>
            <SectionHeader icon={Briefcase} title="MEETING MODE" />
            <div>
                <label htmlFor="report-template" className="block text-sm font-medium text-gray-300 mb-1">Report Template</label>
                <textarea
                    id="report-template"
                    value={settings.meetingReportTemplate}
                    onChange={(e) => updateSettings('meetingReportTemplate', e.target.value)}
                    rows={6}
                    className="w-full bg-black/50 border border-[var(--border-color)] rounded-md p-3 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Meeting report template editor"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Use placeholders: <code className="text-gray-400">{`{{title}}`}</code>, <code className="text-gray-400">{`{{summary}}`}</code>, <code className="text-gray-400">{`{{actionItems}}`}</code>, <code className="text-gray-400">{`{{keyDecisions}}`}</code>. The system will replace these with generated content.
                </p>
            </div>
        </SettingsCard>

        <SettingsCard>
            <SectionHeader icon={Share2} title="INTELLIGENCE CORE" />
            <div className="space-y-2">
              <button 
                  onClick={() => setShowCognitiveMap(true)} 
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                  <Share2 size={18} />View Cognitive Map
              </button>
              <button 
                  onClick={() => setShowMemoryMatrix(true)} 
                  className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                  <Brain size={18} />Manage Memory Matrix
              </button>
            </div>
        </SettingsCard>
        
        <SettingsCard>
          <SectionHeader icon={BarChart3} title="SYSTEM COMMANDS" />
          <div className="space-y-2">
            <button 
              onClick={() => setView('vettingQueue')} 
              className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Inbox size={18} /> Vetting Queue
            </button>
            <button 
              onClick={() => setShowStatsModal(true)} 
              className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <BarChart3 size={18} />System Analytics
            </button>
            <button 
              onClick={() => setShowKeyboardShortcuts(true)} 
              className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Keyboard size={18} />Hotkeys
            </button>
            <button 
              onClick={exportChat} 
              className="w-full text-left px-3 py-2 hover:bg-cyan-900/50 rounded-sm text-gray-200 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Download size={18} />Export Log
            </button>
            <button 
              onClick={clearChat} 
              className="w-full text-left px-3 py-2 hover:bg-red-900/50 rounded-sm text-red-400 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Trash2 size={18} />Purge Log
            </button>
          </div>
        </SettingsCard>

        <SettingsCard>
          <SectionHeader icon={Phone} title="COMMS LOG" />
          {callHistory.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {callHistory.map(call => (
                <div 
                  key={call.id} 
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-700 last:border-b-0"
                >
                  <span className="text-gray-300">{new Date(call.timestamp).toLocaleString()}</span>
                  <span className="text-gray-400">{formatTime(call.duration)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No calls have been logged.</p>
          )}
        </SettingsCard>
      </div>
    </div>
    </>
  );
};

export default SettingsScreen;