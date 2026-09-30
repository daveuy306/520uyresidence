import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { DynamicIcon } from './IconPicker';

export default function TransactionList({ transactions, categories, onEdit, onDelete, onAddNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('all');

  // Build quick category lookup for icons and colors
  const categoryMap = useMemo(() => {
    const map = {};
    [...(categories.income || []), ...(categories.expense || [])].forEach((cat) => {
      map[cat.name] = cat;
    });
    return map;
  }, [categories]);

  // Filter and sort transactions by date descending
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || tx.type === filterType;
        const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, filterType, filterCategory]);

  const allCategoryNames = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, edit, or delete any income and expense records.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161920] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0f1117] border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0f1117] border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition max-w-[150px] sm:max-w-none"
          >
            <option value="all">All Categories</option>
            {allCategoryNames.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-[#161920] border border-slate-800/80 rounded-2xl p-12 text-center">
          <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-slate-300 font-semibold">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or adding a new transaction.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const catMeta = categoryMap[tx.category];
            const iconName = catMeta ? catMeta.icon : 'Tag';
            const catColor = catMeta ? catMeta.color : '#6366f1';
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="bg-[#161920] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm group"
              >
                {/* Left Side: Category Icon + Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner"
                    style={{ backgroundColor: catColor }}
                  >
                    <DynamicIcon name={iconName} className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base leading-tight">{tx.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {tx.date}
                      </span>
                      {tx.notes && <span className="truncate max-w-[200px] text-slate-500">"{tx.notes}"</span>}
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount + Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold font-mono flex items-center gap-1 justify-end ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'} ${parseFloat(tx.amount).toFixed(2)}
                      {isExpense ? (
                        <ArrowDownLeft className="w-4 h-4 text-rose-400 inline" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400 inline" />
                      )}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${tx.title}"?`)) {
                          onDelete(tx.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
