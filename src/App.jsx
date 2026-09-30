import React, { useState, useEffect } from 'react';
import PasscodeModal from './components/PasscodeModal';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import CategoriesManager from './components/CategoriesManager';
import Analytics from './components/Analytics';
import TransactionModal from './components/TransactionModal';
import {
  getAuthStatus,
  setAuthStatus,
  getStoredCategories,
  saveStoredCategories,
  getStoredTransactions,
  saveStoredTransactions,
  resetDataToDefaults,
} from './utils/storage';
import { subscribeToCloudData, saveCloudData } from './utils/firebase';
import { RefreshCw, CloudCheck, Cloud } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'transactions', 'analytics', 'categories'
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [transactions, setTransactions] = useState(() => getStoredTransactions());
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Subscribe to real-time Firebase Cloud Sync across devices
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = subscribeToCloudData((data) => {
        if (data.categories) {
          setCategories(data.categories);
          saveStoredCategories(data.categories);
        }
        if (data.transactions) {
          setTransactions(data.transactions);
          saveStoredTransactions(data.transactions);
        }
        setIsCloudSynced(true);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Sync to local storage & Firebase cloud
  const handleSaveCategories = (newCategories) => {
    setCategories(newCategories);
    saveStoredCategories(newCategories);
    saveCloudData(newCategories, transactions);
  };

  const handleSaveTransactions = (newTransactions) => {
    setTransactions(newTransactions);
    saveStoredTransactions(newTransactions);
    saveCloudData(categories, newTransactions);
  };

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setAuthStatus(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthStatus(false);
  };

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAddOrUpdateTransaction = (txData) => {
    let updated;
    if (editingTransaction) {
      updated = transactions.map((t) => (t.id === txData.id ? txData : t));
    } else {
      updated = [txData, ...transactions];
    }
    handleSaveTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    handleSaveTransactions(updated);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all transactions and categories to default sample data?')) {
      const reset = resetDataToDefaults();
      setCategories(reset.categories);
      setTransactions(reset.transactions);
      saveCloudData(reset.categories, reset.transactions);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 flex flex-col md:flex-row">
      {/* Passcode Lock Screen */}
      {!isAuthenticated && <PasscodeModal onAuthenticate={handleAuthenticate} />}

      {/* Authenticated Application UI */}
      {isAuthenticated && (
        <>
          {/* Responsive Navigation Side/Bottom */}
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-12 w-full">
            {/* Top Toolbar Cloud Sync & Reset Option */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                {isCloudSynced ? <CloudCheck className="w-4 h-4 text-emerald-400" /> : <Cloud className="w-4 h-4 text-indigo-400" />}
                <span className="font-medium">Firebase Cloud Sync Active</span>
              </div>

              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition px-2.5 py-1 rounded-lg bg-[#161920] border border-slate-800"
                title="Reset sample data"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Data
              </button>
            </div>

            {/* Active View Switcher */}
            {activeTab === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                categories={categories}
                onOpenAddModal={handleOpenAddModal}
                onEditTransaction={handleOpenEditModal}
                onViewAll={() => setActiveTab('transactions')}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionList
                transactions={transactions}
                categories={categories}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTransaction}
                onAddNew={handleOpenAddModal}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics transactions={transactions} categories={categories} />
            )}

            {activeTab === 'categories' && (
              <CategoriesManager
                categories={categories}
                onSaveCategories={handleSaveCategories}
              />
            )}

            {/* Add / Edit Transaction Modal */}
            <TransactionModal
              isOpen={isTxModalOpen}
              onClose={() => setIsTxModalOpen(false)}
              onSave={handleAddOrUpdateTransaction}
              editingTransaction={editingTransaction}
              categories={categories}
            />
          </main>
        </>
      )}
    </div>
  );
}
