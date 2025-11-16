import React from 'react';
import { ExternalLink, MapPin, Briefcase, Building, Bot, BrainCircuit, FileText } from 'lucide-react';
import type { JobContent, JobListing } from '../lib/types';

interface JobListingDisplayProps {
  job: JobContent;
  resumeContent: { name: string; content: string } | null;
  handleAnalyzeSynergy: (listing: JobListing) => void;
  handleStartInterview: (listing: JobListing) => void;
  handleDraftCoverLetter: (listing: JobListing) => void;
}

const JobListingDisplay: React.FC<JobListingDisplayProps> = ({ job, resumeContent, handleAnalyzeSynergy, handleStartInterview, handleDraftCoverLetter }) => {
    if (!job || job.listings.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <Briefcase size={16} /> JOB OPPORTUNITIES
            </h3>
            <div className="space-y-3">
                {job.listings.map((listing, index) => (
                    <div
                        key={index}
                        className="bg-black/40 p-4 rounded-md border border-gray-700 hover:border-cyan-500 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors text-base leading-snug">{listing.title}</h4>
                            {listing.isRemote && (
                                <span className="text-xs bg-green-900/50 text-green-300 border border-green-700 px-2 py-0.5 rounded-full">Remote</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 text-xs mt-1.5">
                            <span className="flex items-center gap-1.5"><Building size={14} /> {listing.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {listing.location}</span>
                        </div>
                        <p className="text-gray-300 mt-3 text-sm leading-relaxed">{listing.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-700 flex items-center gap-2 flex-wrap">
                            <a
                                href={listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
                            >
                                Apply Now <ExternalLink size={14} />
                            </a>
                             <button
                                onClick={() => handleStartInterview(listing)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-900/50 border border-cyan-700 rounded-md hover:bg-cyan-800 text-cyan-300 transition-colors"
                            >
                                <Bot size={14} /> Simulate Interview
                            </button>
                            <button
                                onClick={() => handleDraftCoverLetter(listing)}
                                disabled={!resumeContent}
                                title={!resumeContent ? "Upload a resume to enable this feature" : "Draft Cover Letter"}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-900/50 border border-indigo-700 rounded-md hover:bg-indigo-800 text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText size={14} /> Draft Cover Letter
                            </button>
                            {resumeContent && (
                                <button
                                    onClick={() => handleAnalyzeSynergy(listing)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-900/50 border border-purple-700 rounded-md hover:bg-purple-800 text-purple-300 transition-colors"
                                >
                                    <BrainCircuit size={14} /> Analyze Synergy
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobListingDisplay;
