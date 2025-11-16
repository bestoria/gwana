import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Workflow, WorkflowStep, WorkflowActionType, WorkflowTrigger } from '@/src/lib/types';
import { WORKFLOW_ACTIONS } from '@/src/lib/constants';

interface WorkflowEditorModalProps {
    workflowToEdit?: Workflow;
    onSave: (workflow: Workflow) => void;
    onClose: () => void;
}

const Toggle = ({ checked, onChange, ariaLabel }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, ariaLabel: string }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" aria-label={ariaLabel} />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
    </label>
);

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({ workflowToEdit, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [trigger, setTrigger] = useState<WorkflowTrigger>({ type: 'manual' });
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (workflowToEdit) {
            setName(workflowToEdit.name);
            setSteps(workflowToEdit.steps);
            setTrigger(workflowToEdit.trigger);
            setIsEnabled(workflowToEdit.isEnabled ?? false);
        } else {
            setName('');
            setSteps([]);
            setTrigger({ type: 'manual' });
            setIsEnabled(false);
        }
    }, [workflowToEdit]);

    const handleSave = () => {
        if (!name.trim()) {
            setError('Workflow Name is required.');
            return;
        }
        if (steps.length === 0) {
            setError('A workflow must have at least one step.');
            return;
        }
        setError('');
        onSave({
            id: workflowToEdit?.id || `wf_${Date.now()}`,
            name: name.trim(),
            trigger,
            steps,
            isEnabled,
        });
    };
    
    const addStep = (type: WorkflowActionType) => {
        const newStep: WorkflowStep = {
            id: `step_${Date.now()}`,
            type,
            params: {},
        };
        setSteps([...steps, newStep]);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(step => step.id !== id));
    };

    const updateStep = (id: string, newStepData: Partial<WorkflowStep>) => {
        setSteps(steps.map(step => step.id === id ? { ...step, ...newStepData } : step));
    };
    
    const moveStep = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
            return;
        }
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const renderParamInput = (step: WorkflowStep, stepIndex: number, paramKey: string, paramConfig: any) => {
        const potentialInputs = steps.slice(0, stepIndex).filter(s => {
            const action = WORKFLOW_ACTIONS[s.type];
            return action.output.feedsInto?.includes(paramKey);
        });

        const isLinked = step.inputFromStep?.paramToFeed === paramKey;

        return (
            <div key={paramKey} className="space-y-1">
                <label className="text-xs text-gray-400">{paramConfig.label}</label>
                {!isLinked ? (
                     paramConfig.type === 'select' ? (
                        <select
                            value={step.params[paramKey] || ''}
                            onChange={e => updateStep(step.id, { params: { ...step.params, [paramKey]: e.target.value } })}
                            className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm"
                        >
                            <option value="">Default</option>
                            {paramConfig.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : (
                        <input
                            type={paramConfig.type === 'number' ? 'number' : 'text'}
                            value={step.params[paramKey] || ''}
                            placeholder={paramConfig.placeholder}
                            onChange={e => updateStep(step.id, { params: { ...step.params, [paramKey]: e.target.value } })}
                            className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm"
                        />
                    )
                ) : (
                    <div className="bg-black/50 p-2 rounded-md border border-dashed border-cyan-500 text-sm text-cyan-300">
                        Input from: Step {steps.findIndex(s => s.id === step.inputFromStep!.stepId) + 1}
                    </div>
                )}
                {potentialInputs.length > 0 && (
                     <select
                        value={isLinked ? step.inputFromStep!.stepId : ''}
                        onChange={(e) => {
                            const sourceStepId = e.target.value;
                            const newStepData: Partial<WorkflowStep> = sourceStepId
                                ? { inputFromStep: { stepId: sourceStepId, paramToFeed: paramKey }, params: { ...step.params, [paramKey]: undefined } }
                                : { inputFromStep: undefined };
                            updateStep(step.id, newStepData);
                        }}
                        className="w-full text-xs bg-gray-800 border border-gray-600 rounded mt-1 p-1"
                    >
                        <option value="">Use static value</option>
                        {potentialInputs.map((s, i) => (
                            <option key={s.id} value={s.id}>
                                Use output from Step {steps.indexOf(s) + 1}: {WORKFLOW_ACTIONS[s.type].label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    const renderTriggerInputs = () => {
        switch(trigger.type) {
            case 'daily':
                return <input type="time" value={trigger.time} onChange={e => setTrigger({ ...trigger, time: e.target.value })} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm" />;
            case 'weekly':
                return (
                    <div className="space-y-2">
                        <input type="time" value={trigger.time} onChange={e => setTrigger({ ...trigger, time: e.target.value })} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm" />
                        <div className="flex justify-between gap-1">
                            {daysOfWeek.map((day, index) => (
                                <button key={day} onClick={() => {
                                    const newDays = trigger.days.includes(index)
                                        ? trigger.days.filter(d => d !== index)
                                        : [...trigger.days, index];
                                    setTrigger({ ...trigger, days: newDays });
                                }} className={`w-8 h-8 rounded-full text-xs transition-colors ${trigger.days.includes(index) ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'once':
                const dateVal = trigger.datetime ? new Date(trigger.datetime).toISOString().slice(0, 16) : '';
                return <input type="datetime-local" value={dateVal} onChange={e => setTrigger({ ...trigger, datetime: new Date(e.target.value).getTime() })} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm" />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-2xl w-full h-[90vh] flex flex-col font-mono" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-300">{workflowToEdit ? 'Edit Workflow' : 'Create Workflow'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                
                <div className="mb-4 flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Workflow Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Daily News Briefing" className="w-full bg-black/50 border border-gray-600 rounded-md p-2 text-sm"/>
                </div>

                <div className="mb-4 p-3 bg-black/30 rounded-lg border border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-cyan-400">Automation Trigger</h4>
                        <Toggle checked={isEnabled} onChange={e => setIsEnabled(e.target.checked)} ariaLabel="Enable Automation"/>
                    </div>
                    {isEnabled && (
                        <div className="mt-3 space-y-2">
                            <select value={trigger.type} onChange={e => setTrigger({ type: e.target.value } as WorkflowTrigger)} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm">
                                <option value="manual">Manual</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="once">Once</option>
                            </select>
                            {renderTriggerInputs()}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    <h4 className="font-semibold text-cyan-400">Steps</h4>
                    {steps.map((step, index) => (
                        <div key={step.id} className="bg-black/30 p-3 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-cyan-400">Step {index + 1}: {WORKFLOW_ACTIONS[step.type].label}</h4>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => moveStep(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUp size={16} /></button>
                                    <button onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1} className="p-1 disabled:opacity-30"><ArrowDown size={16} /></button>
                                    <button onClick={() => removeStep(step.id)} className="p-1 text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(WORKFLOW_ACTIONS[step.type].params).map(([paramKey, paramConfig]) =>
                                    renderParamInput(step, index, paramKey, paramConfig)
                                )}
                            </div>
                        </div>
                    ))}
                     {steps.length === 0 && <p className="text-center text-gray-500 py-8">No steps yet. Add a step to begin.</p>}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
                    <div className="group relative">
                         <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-900/50 border border-cyan-700 rounded-md hover:bg-cyan-800 text-cyan-300 transition-colors">
                            <Plus size={16} /> Add Step
                        </button>
                        <div className="absolute bottom-full mb-2 w-full bg-black/80 border border-gray-600 rounded-md p-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                           {Object.entries(WORKFLOW_ACTIONS).map(([key, action]) => (
                               <button key={key} onClick={() => addStep(key as WorkflowActionType)} className="w-full text-left p-2 hover:bg-cyan-900/50 rounded text-sm">
                                   {action.label}
                               </button>
                           ))}
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

                <div className="mt-6 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700/50 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md flex items-center gap-2"><Save size={16} /> Save Workflow</button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowEditorModal;
