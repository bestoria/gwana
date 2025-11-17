import React from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import type { StudyHubItem } from '@/src/lib/types';

interface StudyMaterialViewProps {
  items: StudyHubItem[];
  selectedItem: StudyHubItem | null;
  onItemSelect: (item: StudyHubItem) => void;
}

export const StudyMaterialView: React.FC<StudyMaterialViewProps> = ({
  items,
  selectedItem,
  onItemSelect
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              selectedItem?.id === item.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <div className="flex items-start gap-3">
              <FileText className="text-primary flex-shrink-0 mt-1" size={20} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {item.estimatedTime}
                  </span>
                  {item.completed && (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle size={12} />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
