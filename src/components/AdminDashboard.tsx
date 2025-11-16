import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../lib/types';
import * as userService from '../services/userService';
import { Search, User, ShieldCheck, ShieldAlert, Plus, Loader } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = () => {
            setIsLoading(true);
            try {
                const allUsers = userService.getAllUsers();
                setUsers(allUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("Error fetching users from local storage.");
            }
            setIsLoading(false);
        };
        fetchUsers();
    }, [lastUpdated]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        );
    }, [users, searchTerm]);

    const handleSubscriptionChange = async (userId: string, action: 'toggle' | 'add', durationDays?: number, plan?: 'monthly' | 'quarterly' | 'annually') => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        let newSubscription = { ...user.subscription };

        if (action === 'toggle') {
            newSubscription.isActive = !newSubscription.isActive;
            if (newSubscription.isActive && (!newSubscription.expiresAt || newSubscription.expiresAt < Date.now())) {
                newSubscription.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
                newSubscription.plan = 'monthly';
            }
        } else if (action === 'add' && durationDays && plan) {
            const currentExpiry = (newSubscription.expiresAt && newSubscription.expiresAt > Date.now()) ? newSubscription.expiresAt : Date.now();
            newSubscription.expiresAt = currentExpiry + durationDays * 24 * 60 * 60 * 1000;
            newSubscription.isActive = true;
            newSubscription.plan = plan;
        }

        const updatedUser = userService.updateUser(userId, { subscription: newSubscription });
        
        if (!updatedUser) {
            alert("Failed to update subscription.");
        } else {
            setLastUpdated(Date.now());
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] text-white font-mono p-4 sm:p-6">
            <h1 className="text-3xl font-bold text-cyan-300 mb-4">Admin Dashboard</h1>
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="Search by name or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-[var(--border-color)] rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
            </div>
            <div className="flex-1 bg-black/30 border border-[var(--border-color)] rounded-lg overflow-y-auto">
                {isLoading ? <div className="flex justify-center items-center h-full"><Loader size={32} className="animate-spin text-cyan-400" /></div> : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/50 sticky top-0">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Subscription</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredUsers.map(user => {
                                const isSubActive = user.subscription.plan !== 'free' && user.subscription.isActive && user.subscription.expiresAt && user.subscription.expiresAt > Date.now();
                                const isFreePlan = user.subscription.plan === 'free';
                                 return (
                                <tr key={user.id}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><User size={16}/></div>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 text-xs font-semibold" 
                                          style={{ 
                                            color: isSubActive ? 'var(--accent-green)' : (isFreePlan ? 'var(--accent-amber)' : '#ff0055')
                                          }}>
                                            {isSubActive ? <ShieldCheck size={14}/> : isFreePlan ? <ShieldCheck size={14} /> : <ShieldAlert size={14}/>}
                                            {isSubActive ? 'Active' : isFreePlan ? 'Free Tier' : 'Inactive'}
                                        </div>
                                        {!isFreePlan && user.subscription.expiresAt && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()}</p>}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-1 flex-wrap">
                                            {!isFreePlan && <button 
                                              onClick={() => handleSubscriptionChange(user.id, 'toggle')} 
                                              className="px-2 py-1 text-xs rounded-md transition-colors"
                                              style={{
                                                backgroundColor: isSubActive ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 255, 0, 0.3)',
                                                color: isSubActive ? '#ff0055' : 'var(--accent-green)'
                                              }}
                                            >{isSubActive ? 'Disable' : 'Enable'}</button>}
                                            <button onClick={() => handleSubscriptionChange(user.id, 'add', 30, 'monthly')} className="px-2 py-1 text-xs rounded-md flex items-center gap-1" style={{ backgroundColor: 'rgba(0, 255, 255, 0.3)', color: 'var(--accent-cyan)' }}><Plus size={12}/>1M</button>
                                            <button onClick={() => handleSubscriptionChange(user.id, 'add', 90, 'quarterly')} className="px-2 py-1 text-xs rounded-md flex items-center gap-1" style={{ backgroundColor: 'rgba(0, 255, 255, 0.3)', color: 'var(--accent-cyan)' }}><Plus size={12}/>3M</button>
                                            <button onClick={() => handleSubscriptionChange(user.id, 'add', 365, 'annually')} className="px-2 py-1 text-xs rounded-md flex items-center gap-1" style={{ backgroundColor: 'rgba(0, 255, 255, 0.3)', color: 'var(--accent-cyan)' }}><Plus size={12}/>1Y</button>
                                        </div>
                                    </td>
                                </tr>
                                 )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
