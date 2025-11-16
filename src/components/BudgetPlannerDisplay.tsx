import React from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { BudgetPlannerContent } from '../lib/types';

interface BudgetPlannerDisplayProps {
  budget: BudgetPlannerContent;
}

const BudgetPlannerDisplay: React.FC<BudgetPlannerDisplayProps> = ({ budget }) => {
    if (!budget) return null;

    const { summary, incomeSources, expenseCategories } = budget;
    const netBalanceColor = summary.netBalance >= 0 ? 'text-green-400' : 'text-red-400';

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
            <div className="grid grid-cols-3 gap-2 text-center bg-black/40 p-3 rounded-md border border-gray-700 mb-4">
                <div>
                    <p className="text-sm text-green-400">Income</p>
                    <p className="text-lg font-bold text-white">₦{summary.totalIncome.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-red-400">Expenses</p>
                    <p className="text-lg font-bold text-white">₦{summary.totalExpenses.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-cyan-400">Net Balance</p>
                    <p className={`text-lg font-bold ${netBalanceColor}`}>₦{summary.netBalance.toLocaleString()}</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income */}
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><TrendingUp size={16} /> Income Sources</h4>
                    <div className="space-y-1 text-sm">
                        {incomeSources.map((source, index) => (
                            <div key={index} className="flex justify-between p-2 bg-black/20 rounded">
                                <span className="text-gray-300">{source.source}</span>
                                <span className="font-semibold text-green-300">+₦{source.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expenses */}
                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2"><TrendingDown size={16} /> Expense Categories</h4>
                    <div className="space-y-2 text-sm">
                        {expenseCategories.map((cat, index) => (
                            <details key={index} className="bg-black/20 rounded p-2">
                                <summary className="cursor-pointer flex justify-between">
                                    <span className="text-gray-300">{cat.category}</span>
                                    <span className="font-semibold text-red-300">-₦{cat.allocated.toLocaleString()}</span>
                                </summary>
                                <ul className="mt-2 pl-6 list-disc text-xs text-gray-400 space-y-1">
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