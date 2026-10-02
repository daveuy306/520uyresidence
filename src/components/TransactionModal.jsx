import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const getTodayLocalDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TransactionModal({ isOpen, onClose, onSave, editingTransaction, categories }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayLocalDateStr);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setTitle(editingTransaction.title || '');
      setAmount(editingTransaction.amount?.toString() || '');
      setCategory(editingTransaction.category || '');
      setDate(editingTransaction.date || getTodayLocalDateStr());
      setNotes(editingTransaction.notes || '');
    } else {
      // Reset for new transaction
      setType('expense');
      setTitle('');
      setAmount('');
      const defaultCategoryList = categories.expense || [];
      setCategory(defaultCategoryList[0]?.name || '');
      setDate(getTodayLocalDateStr());
      setNotes('');
    }
  }, [editingTransaction, isOpen, categories]);

  // When type changes, adjust category selection to match type
  const handleTypeChange = (newType) => {
    setType(newType);
    const availableCategories = categories[newType] || [];
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0].name);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;

    const transactionData = {
      id: editingTransaction ? editingTransaction.id : `tx_${Date.now()}`,
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes: notes.trim(),
    };

    onSave(transactionData);
    onClose();
  };

  const currentCategoryList = categories[type] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#161920] border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {editingTransaction ? 'Edit Entry' : 'Add New Entry'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Income / Expense Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#0f1117] p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Amount
            </label>
            <div className="relative flex items-center">
              <DollarSign className="absolute left-3.5 text-slate-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 text-white text-lg font-bold rounded-xl py-2.5 pl-10 pr-4 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl py-2.5 px-3.5 focus:outline-none transition"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <div className="relative flex items-center">
              <Tag className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none transition appearance-none"
                required
              >
                {currentCategoryList.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-[#161920] text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Notes (Optional)
            </label>
            <div className="relative flex items-start">
              <input
                type="text"
                placeholder="Additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl py-2.5 px-3.5 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition active:scale-[0.98] ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {editingTransaction ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
