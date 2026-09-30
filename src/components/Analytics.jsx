import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { DynamicIcon } from './IconPicker';

export default function Analytics({ transactions, categories }) {
  const currentMonthDate = new Date();
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  // 1. Month-over-Month Comparison Data (Last 6 Months)
  const monthlyComparisonData = useMemo(() => {
    const monthMap = {};

    // Prepare last 6 calendar months key list
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      monthMap[key] = {
        monthKey: key,
        month: label,
        Income: 0,
        Expense: 0,
        Savings: 0,
      };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        if (tx.type === 'income') {
          monthMap[key].Income += tx.amount;
        } else {
          monthMap[key].Expense += tx.amount;
        }
      }
    });

    return Object.values(monthMap).map((m) => ({
      ...m,
      Income: parseFloat(m.Income.toFixed(2)),
      Expense: parseFloat(m.Expense.toFixed(2)),
      Savings: parseFloat((m.Income - m.Expense).toFixed(2)),
    }));
  }, [transactions, currentYear, currentMonth]);

  // 2. Current Month Expense Category Percentages Breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const categoryTotals = {};
    let totalMonthExpense = 0;

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (
        tx.type === 'expense' &&
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth
      ) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        totalMonthExpense += tx.amount;
      }
    });

    const categoryMetaMap = {};
    (categories.expense || []).forEach((cat) => {
      categoryMetaMap[cat.name] = cat;
    });

    const breakdownList = Object.keys(categoryTotals).map((catName) => {
      const amount = categoryTotals[catName];
      const percentage = totalMonthExpense > 0 ? (amount / totalMonthExpense) * 100 : 0;
      const meta = categoryMetaMap[catName] || { icon: 'Tag', color: '#6366f1' };

      return {
        name: catName,
        amount,
        percentage,
        icon: meta.icon,
        color: meta.color,
      };
    });

    return {
      totalMonthExpense,
      breakdownList: breakdownList.sort((a, b) => b.amount - a.amount),
    };
  }, [transactions, categories, currentYear, currentMonth]);

  const currentMonthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Month-over-month comparisons & expense percentage breakdowns.
        </p>
      </div>

      {/* Month-over-Month Comparison Chart */}
      <div className="bg-[#161920] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Month-over-Month Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comparing previous 5 months with current month</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272d37" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f1117', borderColor: '#272d37', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '13px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Category Breakdown & Percentage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Donut Visual */}
        <div className="bg-[#161920] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Expense Distribution ({currentMonthName})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Percentage per expense category</p>
          </div>

          {expenseCategoryBreakdown.breakdownList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No expenses recorded for this month.
            </div>
          ) : (
            <div className="h-64 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryBreakdown.breakdownList}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {expenseCategoryBreakdown.breakdownList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#161920" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f1117', borderColor: '#272d37', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Spent</span>
                <span className="text-lg font-extrabold text-white font-mono">
                  ${expenseCategoryBreakdown.totalMonthExpense.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Category Percentages List */}
        <div className="bg-[#161920] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Category Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Percentages and dollar amounts spent</p>
          </div>

          {expenseCategoryBreakdown.breakdownList.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No category expense breakdown available.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {expenseCategoryBreakdown.breakdownList.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        <DynamicIcon name={item.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono font-medium">${item.amount.toFixed(2)}</span>
                      <span className="font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full bg-[#0f1117] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
