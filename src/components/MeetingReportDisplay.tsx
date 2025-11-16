import React from 'react';
import { formatText, linkifyText } from '@/src/lib/utils';

interface MeetingReportDisplayProps {
  reportText: string;
}

const MeetingReportDisplay: React.FC<MeetingReportDisplayProps> = ({ reportText }) => {
    if (!reportText) return null;

    const formattedHtml = linkifyText(formatText(reportText));

    return (
         <div 
            className="mt-2 text-sm"
            dangerouslySetInnerHTML={{ __html: formattedHtml }} 
        />
    );
};

export default MeetingReportDisplay;