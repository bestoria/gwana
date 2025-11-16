import React from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { BudgetPlannerContent } from '@/src/lib/types';

interface BudgetPlannerDisplayProps {
  budget: BudgetPlannerContent;
}

const BudgetPlannerDisplay: React.FC<BudgetPlannerDisplayProps> = ({ budget }) => {
    if (!budget) return null;

    const { summary, incomeSources, expenseCategories } = budget;
    const netBalanceColor = summary.netBalance >= 0 ? 'var(--accent-green)' : '#ff0055';

    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>

            <h3 className="text-base font-semibold text-cyan-300 mb-3 flex items-center gap-2" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                <PieChart size={18} /> {budget.title.toUpperCase()}
            </h3>

            {/* Summary Section */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-md mb-4" style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid rgba(160, 160, 192, 0.3)' 
            }}>
                <div>
                    <p className="text-sm" style={{ color: 'var(--accent-green)' }}>Income</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₦{summary.totalIncome.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm" style={{ color: '#ff0055' }}>Expenses</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>₦{summary.totalExpenses.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm" style={{ color: 'var(--accent-cyan)' }}>Net Balance</p>
                    <p className="text-lg font-bold" style={{ color: netBalanceColor }}>₦{summary.netBalance.toLocaleString()}</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income */}
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><TrendingUp size={16} /> Income Sources</h4>
                    <div className="space-y-1 text-sm">
                        {incomeSources.map((source, index) => (
                            <div key={index} className="flex justify-between p-2 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{source.source}</span>
                                <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>+₦{source.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expenses */}
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><TrendingDown size={16} /> Expense Categories</h4>
                    <div className="space-y-2 text-sm">
                        {expenseCategories.map((cat, index) => (
                            <details key={index} className="rounded p-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                <summary className="cursor-pointer flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>{cat.category}</span>
                                    <span className="font-semibold" style={{ color: '#ff0055' }}>-₦{cat.allocated.toLocaleString()}</span>
                                </summary>
                                <ul className="mt-2 pl-6 list-disc text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                    {cat.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                                </ul>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetPlannerDisplay;