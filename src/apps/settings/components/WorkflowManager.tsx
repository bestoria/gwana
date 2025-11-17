import React from 'react';
import { Workflow as WorkflowIcon, Plus } from 'lucide-react';
import type { Workflow } from '@/src/core/types';

interface WorkflowManagerProps {
  workflows: Workflow[];
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <WorkflowIcon size={20} className="text-primary" />
          Workflows
        </h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No workflows configured</p>
          <p className="text-sm mt-2">Create a workflow to automate tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{workflow.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workflow.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.isEnabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
