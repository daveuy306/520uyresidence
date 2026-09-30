import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpRight, ArrowDownLeft, Wallet, PieChart } from 'lucide-react';
import { DynamicIcon } from './IconPicker';

export default function Dashboard({ transactions, categories, onOpenAddModal, onEditTransaction, onViewAll }) {
  const currentMonthDate = new Date();
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  // Compute metrics for current month & overall
  const stats = useMemo(() => {
    let currentIncome = 0;
    let currentExpense = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const isCurrentMonth = d.getFullYear() === currentYear && d.getMonth() === currentMonth;

      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (isCurrentMonth) currentIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (isCurrentMonth) currentExpense += tx.amount;
      }
    });

    const netSavings = currentIncome - currentExpense;
    const savingsRate = currentIncome > 0 ? Math.max(0, ((currentIncome - currentExpense) / currentIncome) * 100) : 0;

    return {
      totalBalance: totalIncome - totalExpense,
      currentIncome,
      currentExpense,
      netSavings,
      savingsRate,
    };
  }, [transactions, currentYear, currentMonth]);

  // Quick category map
  const categoryMap = useMemo(() => {
    const map = {};
    [...(categories.income || []), ...(categories.expense || [])].forEach((cat) => {
      map[cat.name] = cat;
    });
    return map;
  }, [categories]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h2>
          <p className="text-xs text-slate-400 mt-1">Summary for <span className="text-indigo-400 font-semibold">{monthName}</span></p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <div className="bg-[#161920] border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Balance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white font-mono">
              ${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Cumulative net balance</p>
          </div>
        </div>

        {/* Current Month Income */}
        <div className="bg-[#161920] border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono">
              +${stats.currentIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Earned this month</p>
          </div>
        </div>

        {/* Current Month Expenses */}
        <div className="bg-[#161920] border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-400 font-mono">
              -${stats.currentExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Spent this month</p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-[#161920] border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-violet-400 font-mono">
              {stats.savingsRate.toFixed(1)}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Net saved: ${stats.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-[#161920] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Entries</h3>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            View All &rarr;
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No recent transactions to display.</p>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const catMeta = categoryMap[tx.category];
              const iconName = catMeta ? catMeta.icon : 'Tag';
              const catColor = catMeta ? catMeta.color : '#6366f1';
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="bg-[#0f1117] hover:bg-[#1a1f2c] border border-slate-800/60 rounded-xl p-3 flex items-center justify-between transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner"
                      style={{ backgroundColor: catColor }}
                    >
                      <DynamicIcon name={iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{tx.category} • {tx.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'} ${parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
