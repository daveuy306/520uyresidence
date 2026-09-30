import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import IconPicker, { DynamicIcon } from './IconPicker';

export default function CategoriesManager({ categories, onSaveCategories }) {
  const [activeTab, setActiveTab] = useState('expense'); // 'income' or 'expense'
  const [editingCategory, setEditingCategory] = useState(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const currentCategoryList = categories[activeTab] || [];

  const handleOpenIconPickerForCategory = (cat) => {
    setEditingCategory(cat);
    setIsIconPickerOpen(true);
  };

  const handleIconSelected = ({ icon, color }) => {
    if (editingCategory) {
      // Edit existing category
      const updatedList = categories[activeTab].map((cat) =>
        cat.id === editingCategory.id ? { ...cat, icon, color } : cat
      );
      onSaveCategories({
        ...categories,
        [activeTab]: updatedList,
      });
      setEditingCategory(null);
    } else {
      // Setting icon/color for new category
      setNewCatIcon(icon);
      setNewCatColor(color);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
      type: activeTab,
    };

    onSaveCategories({
      ...categories,
      [activeTab]: [...categories[activeTab], newCategory],
    });

    setNewCatName('');
    setNewCatIcon('Tag');
    setNewCatColor('#6366f1');
  };

  const handleDeleteCategory = (catId) => {
    if (categories[activeTab].length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    const updatedList = categories[activeTab].filter((cat) => cat.id !== catId);
    onSaveCategories({
      ...categories,
      [activeTab]: updatedList,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Category Manager</h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize icons, colors, and names for income and expense categories.
        </p>
      </div>

      {/* Income / Expense Tabs */}
      <div className="flex bg-[#161920] p-1.5 rounded-2xl border border-slate-800/80 max-w-md">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'expense'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" /> Expense Categories ({categories.expense?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'income'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" /> Income Categories ({categories.income?.length || 0})
        </button>
      </div>

      {/* Add New Category Form */}
      <form onSubmit={handleAddCategory} className="bg-[#161920] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
          Add Custom {activeTab === 'income' ? 'Income' : 'Expense'} Category
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsIconPickerOpen(true);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0f1117] border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-medium text-slate-200 transition"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: newCatColor }}
            >
              <DynamicIcon name={newCatIcon} className="w-4 h-4" />
            </div>
            <span>Change Icon</span>
          </button>

          <input
            type="text"
            placeholder="Category Name (e.g., Side Hustle)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-[#0f1117] border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
            required
          />

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </form>

      {/* Categories List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentCategoryList.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#161920] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex items-center justify-between transition group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: cat.color || '#6366f1' }}
              >
                <DynamicIcon name={cat.icon} className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{cat.name}</span>
                <span className="text-[11px] text-slate-400 font-medium capitalize">
                  {cat.type} Category
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleOpenIconPickerForCategory(cat)}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition"
                title="Change Icon & Color"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Icon Picker Dialog Modal */}
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIcon={editingCategory ? editingCategory.icon : newCatIcon}
        currentColor={editingCategory ? editingCategory.color : newCatColor}
        onSelect={handleIconSelected}
      />
    </div>
  );
}
