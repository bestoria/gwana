import React from 'react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

const NewsDesk: React.FC = () => {
    const { callState } = useLiveAPIContext();
    const isBroadcasting = callState === 'connected' || callState === 'paused';

    return (
        <div className="news-desk">
            <div className={`news-desk-light ${isBroadcasting ? 'active' : ''}`} />
            <span className={`news-desk-text ${isBroadcasting ? 'active' : ''}`}>
                {isBroadcasting ? 'ON AIR' : 'OFF AIR'}
            </span>
        </div>
    );
};

export default NewsDesk;