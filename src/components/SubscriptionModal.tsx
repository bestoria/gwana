import React from 'react';
import { X, MessageSquare, Phone, ShieldAlert, Package, Calendar, Check } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
  isExpired: boolean;
}

const PlanCard: React.FC<{ title: string; price: string; features: string[] }> = ({ title, price, features }) => (
    <div className="p-4 rounded-lg text-center flex flex-col" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(160, 160, 192, 0.3)' }}>
        <h3 className="font-bold text-lg" style={{ color: 'var(--accent-cyan)' }}>{title}</h3>
        <p className="text-2xl font-bold my-2">{price}</p>
        <ul className="text-xs space-y-1 mt-auto" style={{ color: 'var(--text-secondary)' }}>
            {features.map((feat, i) => <li key={i} className="flex items-center justify-center gap-2"><Check size={14} style={{ color: 'var(--accent-green)' }}/> {feat}</li>)}
        </ul>
    </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, isExpired }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in"
            onClick={isExpired ? undefined : onClose}
        >
            <div
                className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-2xl w-full shadow-2xl font-mono"
                style={{ boxShadow: '0 0 20px var(--accent-cyan)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-cyan-300">
                        Subscription Plans
                    </h2>
                    {!isExpired && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    )}
                </div>
                 
                 {isExpired && (
                    <div className="p-3 rounded-md text-sm flex items-center gap-3 animate-fade-in" style={{
                      backgroundColor: 'rgba(255, 0, 85, 0.3)',
                      color: '#ff0055',
                      border: '1px solid #ff0055'
                    }}>
                        <ShieldAlert size={20} />
                        <span>Your subscription has expired. Please renew to continue.</span>
                    </div>
                 )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <PlanCard title="Free" price="₦0" features={["5 Minutes Daily", "Standard Access", "Community Support"]} />
                   <PlanCard title="Monthly" price="₦2,000" features={["30 Days Access", "Unlimited Use", "Full Features"]} />
                   <PlanCard title="Quarterly" price="₦5,000" features={["90 Days Access", "15% Discount", "Priority Support"]} />
                   <PlanCard title="Annually" price="₦15,000" features={["365 Days Access", "25% Discount", "All Features"]} />
                </div>
                
                <p className="text-center text-sm text-gray-400 mb-4">To purchase or renew a plan, please contact our sales team.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                        href="tel:+2347010102053"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-900/50 text-blue-300 border border-blue-700 font-semibold rounded-md hover:bg-blue-800 transition-colors"
                    >
                        <Phone size={18} /> Call Sales
                    </a>
                    <a
                        href="https://wa.me/2347010102053"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                        <MessageSquare size={18} /> WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;