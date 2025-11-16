import React, { useMemo, useEffect } from 'react';
import type { Settings } from '@/src/lib/types';
import { linkifyText, formatText } from '@/src/lib/utils';

const AnimatedAiMessage: React.FC<{ text: string; settings: Settings; onComplete: () => void; }> = ({ text, settings, onComplete }) => {
    useEffect(() => {
        // Immediately signal that the "animation" is complete.
        onComplete();
    }, [onComplete]);

    const formattedHtml = useMemo(() => {
        // Render the full text at once, without a cursor.
        return (settings.linkPreview ? linkifyText(formatText(text)) : formatText(text));
    }, [text, settings.linkPreview]);

    return (
        <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
    );
};

export default AnimatedAiMessage;