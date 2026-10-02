import React, { useState, useEffect, useRef } from 'react';
import PasscodeModal from './components/PasscodeModal';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import CategoriesManager from './components/CategoriesManager';
import Analytics from './components/Analytics';
import TransactionModal from './components/TransactionModal';
import GoogleSheetsModal from './components/GoogleSheetsModal';
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
import {
  startCrossDeviceSyncSubscriber,
  initializeCloudSync,
  mutateAndSyncCloudData,
  recordDeletedTxId,
  isValidAppData,
} from './utils/syncEngine';
import { getAutoSyncSheets, syncToGoogleSheets } from './utils/googleSheets';
import { RefreshCw, CloudCheck, Cloud, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'transactions', 'analytics', 'categories'
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [transactions, setTransactions] = useState(() => getStoredTransactions());
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Keep ref up to date for syncEngine getters
  const stateRef = useRef({ categories, transactions });
  useEffect(() => {
    stateRef.current = { categories, transactions };
  }, [categories, transactions]);

  // Initial Sync on launch: Remote cloud is source of truth
  useEffect(() => {
    initializeCloudSync(categories, transactions).then((synced) => {
      if (synced && synced.categories && synced.transactions) {
        setCategories(synced.categories);
        saveStoredCategories(synced.categories);
        setTransactions(synced.transactions);
        saveStoredTransactions(synced.transactions);
      }
    });
  }, []);

  // Cross-device cloud sync subscriber
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Firebase Firestore listener
      const unsubscribeFirebase = subscribeToCloudData((data) => {
        if (isValidAppData(data)) {
          setCategories(data.categories);
          saveStoredCategories(data.categories);
          setTransactions(data.transactions);
          saveStoredTransactions(data.transactions);
          setIsCloudSynced(true);
        }
      });

      // 2. Global REST multi-device sync engine (syncs all devices accessing the app)
      const unsubscribeEngine = startCrossDeviceSyncSubscriber(
        () => stateRef.current,
        (remote) => {
          if (isValidAppData(remote)) {
            setCategories(remote.categories);
            saveStoredCategories(remote.categories);
            setTransactions(remote.transactions);
            saveStoredTransactions(remote.transactions);
            setIsCloudSynced(true);
          }
        }
      );

      return () => {
        unsubscribeFirebase();
        unsubscribeEngine();
      };
    }
  }, [isAuthenticated]);

  const handleSaveCategories = async (newCategories) => {
    if (!newCategories || !Array.isArray(newCategories.income) || !Array.isArray(newCategories.expense)) return;

    setCategories(newCategories);
    saveStoredCategories(newCategories);

    const synced = await mutateAndSyncCloudData(
      (liveCat, liveTx) => ({
        categories: newCategories,
        transactions: liveTx || transactions
      }),
      newCategories,
      transactions
    );

    if (synced) {
      saveCloudData(synced.categories, synced.transactions);
    }
  };

  const handleAuthenticate = () => {
    setIsUnlocking(true);
    // Fetch live shared cloud data immediately upon passcode unlock
    initializeCloudSync(categories, transactions).then((synced) => {
      if (synced && synced.categories && synced.transactions) {
        setCategories(synced.categories);
        saveStoredCategories(synced.categories);
        setTransactions(synced.transactions);
        saveStoredTransactions(synced.transactions);
      }
    });

    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthStatus(true);
      setIsUnlocking(false);
    }, 400);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthStatus(false);
  };

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAddOrUpdateTransaction = async (txData) => {
    setIsTxModalOpen(false);

    // Perform atomic cloud mutation so latest transactions from other devices are preserved
    const synced = await mutateAndSyncCloudData(
      (liveCat, liveTx) => {
        let updated;
        const currentTxList = Array.isArray(liveTx) ? liveTx : transactions;
        const exists = currentTxList.some((t) => t.id === txData.id);

        if (exists || editingTransaction) {
          updated = currentTxList.map((t) => (t.id === txData.id ? txData : t));
        } else {
          updated = [txData, ...currentTxList];
        }

        return {
          categories: liveCat || categories,
          transactions: updated
        };
      },
      categories,
      transactions
    );

    if (synced) {
      setTransactions(synced.transactions);
      saveStoredTransactions(synced.transactions);
      saveCloudData(categories, synced.transactions);

      if (getAutoSyncSheets()) {
        syncToGoogleSheets(synced.transactions, categories).catch(() => {});
      }
    }

    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id) => {
    recordDeletedTxId(id);

    const synced = await mutateAndSyncCloudData(
      (liveCat, liveTx) => {
        const currentTxList = Array.isArray(liveTx) ? liveTx : transactions;
        return {
          categories: liveCat || categories,
          transactions: currentTxList.filter((t) => t.id !== id)
        };
      },
      categories,
      transactions
    );

    if (synced) {
      setTransactions(synced.transactions);
      saveStoredTransactions(synced.transactions);
      saveCloudData(categories, synced.transactions);

      if (getAutoSyncSheets()) {
        syncToGoogleSheets(synced.transactions, categories).catch(() => {});
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all transactions and categories to default sample data across all devices?')) {
      const reset = resetDataToDefaults();
      setCategories(reset.categories);
      setTransactions(reset.transactions);

      await mutateAndSyncCloudData(
        () => ({
          categories: reset.categories,
          transactions: reset.transactions
        }),
        reset.categories,
        reset.transactions
      );

      saveCloudData(reset.categories, reset.transactions);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 flex flex-col md:flex-row">
      {/* Passcode Lock Screen with Smooth Unlock Animation */}
      {!isAuthenticated && (
        <PasscodeModal
          onAuthenticate={handleAuthenticate}
          isUnlocking={isUnlocking}
        />
      )}

      {/* Authenticated Application UI */}
      {isAuthenticated && (
        <div className="flex-1 flex flex-col md:flex-row w-full animate-fade-in">
          {/* Responsive Navigation Side/Bottom */}
          <Navigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-12 w-full">
            {/* Top Toolbar Cloud Sync & Google Sheets Option */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                  {isCloudSynced ? <CloudCheck className="w-4 h-4 text-emerald-400" /> : <Cloud className="w-4 h-4 text-indigo-400" />}
                  <span className="font-medium">Multi-Device Cloud Sync Active</span>
                </div>

                <button
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-[0.98] transition px-3 py-1.5 rounded-xl font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Google Sheets
                </button>
              </div>

              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition px-2.5 py-1.5 rounded-xl bg-[#161920] border border-slate-800 active:scale-[0.98]"
                title="Reset sample data"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Data
              </button>
            </div>

            {/* Active View Switcher with Slide Animation */}
            <div key={activeTab} className="animate-slide-up">
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
            </div>

            {/* Add / Edit Transaction Modal */}
            <TransactionModal
              isOpen={isTxModalOpen}
              onClose={() => setIsTxModalOpen(false)}
              onSave={handleAddOrUpdateTransaction}
              editingTransaction={editingTransaction}
              categories={categories}
            />

            {/* Google Sheets Modal */}
            <GoogleSheetsModal
              isOpen={isSheetsModalOpen}
              onClose={() => setIsSheetsModalOpen(false)}
              transactions={transactions}
              categories={categories}
            />
          </main>
        </div>
      )}
    </div>
  );
}
