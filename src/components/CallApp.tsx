import React, { useState } from 'react';
import { Phone, Video, MessageCircle, Search, ArrowLeft, User, Mail, MapPin, Briefcase, GraduationCap, Heart } from 'lucide-react';
import { contacts, type PersonContact } from '../data/people';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { generateCallSystemInstruction, formatCallContext } from '../services/call/callService';

interface CallAppProps {
  onClose?: () => void;
}

const CallApp: React.FC<CallAppProps> = ({ onClose }) => {
  const [selectedContact, setSelectedContact] = useState<PersonContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    callState, 
    startCall, 
    endCall,
    isAISpeaking,
    isUserSpeaking,
    persona,
    isCameraOn,
    toggleCamera
  } = useLiveAPIContext();

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (type: 'voice' | 'video', contact: PersonContact) => {
    if (!contact) return;
    
    const systemInstruction = generateCallSystemInstruction(contact);
    const initialText = `Hi, this is ${contact.name}. How can I help you today?`;
    
    // Start the call with the AI persona
    startCall(undefined, initialText, systemInstruction, formatCallContext(contact));
    
    // Enable camera for video calls
    if (type === 'video' && !isCameraOn) {
      toggleCamera();
    }
  };

  const handleEndCall = () => {
    endCall('idle');
  };

  const isInCall = callState === 'connected' || callState === 'connecting';

  if (isInCall && selectedContact) {
    const statusText = callState === 'connecting' ? 'Connecting...' : 
                       isAISpeaking ? 'Speaking...' : 
                       isUserSpeaking ? 'Listening...' : 
                       'Connected';
    
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] p-6">
        <div className={`text-6xl mb-4 ${isAISpeaking ? 'animate-pulse' : ''}`}>
          {selectedContact.avatar}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{selectedContact.name}</h2>
        <p className="text-[var(--accent-cyan)] mb-2">{selectedContact.title}</p>
        <p className="text-gray-400 mb-6">{statusText}</p>
        
        {/* Call duration could be added here */}
        
        <div className="flex gap-4">
          <button 
            onClick={handleEndCall}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors flex items-center gap-2"
          >
            <Phone size={20} />
            End Call
          </button>
          
          {isCameraOn && (
            <button 
              onClick={toggleCamera}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <Video size={20} />
              Turn Off Camera
            </button>
          )}
        </div>
      </div>
    );
  }

  if (selectedContact) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-[var(--border-color)]">
          <button 
            onClick={() => setSelectedContact(null)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-[var(--accent-cyan)]" />
          </button>
          <div className="text-4xl">{selectedContact.avatar}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
            <p className="text-sm text-gray-400">{selectedContact.status}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => handleCall('voice', selectedContact)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-green)' }}>
                <Phone size={24} style={{ color: 'white' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Call</span>
            </button>
            
            <button 
              onClick={() => handleCall('video', selectedContact)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-cyan)' }}>
                <Video size={24} style={{ color: 'white' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Video</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-magenta)' }}>
                <MessageCircle size={24} style={{ color: 'white' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Message</span>
            </button>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <InfoItem icon={<Briefcase size={18} />} label="Title" value={selectedContact.title} />
            <InfoItem icon={<Phone size={18} />} label="Phone" value={selectedContact.phone} />
            <InfoItem icon={<Mail size={18} />} label="Email" value={selectedContact.email} />
            <InfoItem icon={<MapPin size={18} />} label="Birth City" value={selectedContact.cityOfBirth} />
            <InfoItem icon={<MapPin size={18} />} label="Current City" value={selectedContact.currentCity} />
          </div>

          {/* About */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--accent-cyan)] mb-2 flex items-center gap-2">
              <User size={18} />
              About
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedContact.backstory}</p>
          </div>

          {/* Education */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--accent-cyan)] mb-3 flex items-center gap-2">
              <GraduationCap size={18} />
              Education
            </h3>
            <div className="space-y-3">
              {selectedContact.education.map((edu, idx) => (
                <div key={idx} className="border-l-2 border-[var(--accent-cyan)] pl-3">
                  <p className="text-white font-medium">{edu.degree}</p>
                  <p className="text-gray-400 text-sm">{edu.institution}</p>
                  <p className="text-gray-500 text-xs">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hobbies */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--accent-cyan)] mb-3 flex items-center gap-2">
              <Heart size={18} />
              Hobbies & Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedContact.hobbies.map((hobby, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-[var(--bg-primary)] text-gray-300 text-sm rounded-full border border-[var(--border-color)]"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>

          {/* Friends */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--accent-cyan)] mb-3">Friends</h3>
            <div className="space-y-2">
              {selectedContact.friends.map((friend, idx) => (
                <div key={idx} className="text-gray-300 text-sm">• {friend}</div>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--accent-cyan)] mb-2">Personality</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedContact.personality}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-bold text-[var(--accent-cyan)] mb-4">Contacts</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedContact(contact)}
            className="w-full p-4 border-b border-[var(--border-color)] hover:bg-white/5 transition-colors flex items-center gap-4 group"
          >
            <div className="text-4xl">{contact.avatar}</div>
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium group-hover:text-[var(--accent-cyan)] transition-colors">
                {contact.name}
              </h3>
              <p className="text-sm text-gray-400">{contact.title}</p>
              <p className="text-xs text-gray-500">{contact.status}</p>
            </div>
            <Phone size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-[var(--accent-cyan)] mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  </div>
);

export default CallApp;
