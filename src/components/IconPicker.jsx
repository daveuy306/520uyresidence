import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { X, Check, Search } from 'lucide-react';

export const ICON_LIST = [
  'Briefcase', 'Laptop', 'TrendingUp', 'Gift', 'Coins', 'Home', 'ShoppingCart',
  'Utensils', 'Car', 'Zap', 'Film', 'HeartPulse', 'ShoppingBag', 'Tv',
  'Plane', 'Coffee', 'Music', 'Smartphone', 'BookOpen', 'Shield', 'Smile',
  'CreditCard', 'PiggyBank', 'DollarSign', 'Award', 'Wrench', 'Fuel', 'Truck',
  'Camera', 'Headphones', 'Gamepad2', 'Dumbbell', 'BriefcaseMedical', 'GraduationCap'
];

export const COLOR_OPTIONS = [
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e', '#fb923c', '#f59e0b',
  '#eab308', '#14b8a6', '#64748b'
];

export default function IconPicker({ isOpen, onClose, currentIcon, currentColor, onSelect }) {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || 'Tag');
  const [selectedColor, setSelectedColor] = useState(currentColor || '#6366f1');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredIcons = ICON_LIST.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    onSelect({ icon: selectedIcon, color: selectedColor });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#161920] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Choose Category Icon & Color</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="py-4 border-b border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Category Accent Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                  selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#161920] scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              >
                {selectedColor === color && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Icon Selector Grid */}
        <div className="py-4 flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-y-auto grid grid-cols-5 sm:grid-cols-6 gap-2.5 pr-1 flex-1">
            {filteredIcons.map((iconName) => {
              const IconComp = Icons[iconName] || Icons.Tag;
              const isSelected = selectedIcon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md'
                      : 'border-slate-800/80 bg-[#1f2430]/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <IconComp className="w-6 h-6 mb-1" style={{ color: isSelected ? selectedColor : undefined }} />
                  <span className="text-[10px] text-slate-400 truncate max-w-full">{iconName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-medium text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            Apply Choice
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to render dynamic icon by name
export function DynamicIcon({ name, className = "w-5 h-5", style = {} }) {
  const IconComp = Icons[name] || Icons.Tag;
  return <IconComp className={className} style={style} />;
}
