// Local storage utilities and default seed data for the Budgeting App

export const CORRECT_PASSCODE = 'uy520';

export const DEFAULT_CATEGORIES = {
  income: [
    { id: 'inc_1', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'income' },
    { id: 'inc_2', name: 'Freelance', icon: 'Laptop', color: '#06b6d4', type: 'income' },
    { id: 'inc_3', name: 'Investments', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
    { id: 'inc_4', name: 'Gifts & Bonus', icon: 'Gift', color: '#f59e0b', type: 'income' },
    { id: 'inc_5', name: 'Other Income', icon: 'Coins', color: '#64748b', type: 'income' },
  ],
  expense: [
    { id: 'exp_1', name: 'Housing & Rent', icon: 'Home', color: '#6366f1', type: 'expense' },
    { id: 'exp_2', name: 'Food & Groceries', icon: 'ShoppingCart', color: '#f43f5e', type: 'expense' },
    { id: 'exp_3', name: 'Dining Out', icon: 'Utensils', color: '#fb923c', type: 'expense' },
    { id: 'exp_4', name: 'Transportation', icon: 'Car', color: '#3b82f6', type: 'expense' },
    { id: 'exp_5', name: 'Utilities & Bills', icon: 'Zap', color: '#eab308', type: 'expense' },
    { id: 'exp_6', name: 'Entertainment', icon: 'Film', color: '#a855f7', type: 'expense' },
    { id: 'exp_7', name: 'Healthcare', icon: 'HeartPulse', color: '#ec4899', type: 'expense' },
    { id: 'exp_8', name: 'Shopping', icon: 'ShoppingBag', color: '#14b8a6', type: 'expense' },
    { id: 'exp_9', name: 'Subscriptions', icon: 'Tv', color: '#6366f1', type: 'expense' },
  ]
};

// Generates initial realistic transactions for current month and 2 prior months
const generateSeedTransactions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getDateStr = (monthOffset, day) => {
    const d = new Date(currentYear, currentMonth + monthOffset, day);
    return d.toISOString().split('T')[0];
  };

  return [
    // Current Month (0 offset)
    { id: 'tx_c1', title: 'Monthly Salary', amount: 4500, type: 'income', category: 'Salary', date: getDateStr(0, 1), notes: 'Primary Tech Corp Paycheck' },
    { id: 'tx_c2', title: 'Apartment Rent', amount: 1450, type: 'expense', category: 'Housing & Rent', date: getDateStr(0, 2), notes: 'Monthly rent' },
    { id: 'tx_c3', title: 'Grocery Supermarket', amount: 185.50, type: 'expense', category: 'Food & Groceries', date: getDateStr(0, 4), notes: 'Weekly groceries' },
    { id: 'tx_c4', title: 'Freelance Web Design', amount: 850, type: 'income', category: 'Freelance', date: getDateStr(0, 6), notes: 'Client UI redesign project' },
    { id: 'tx_c5', title: 'Electric & Internet', amount: 130.00, type: 'expense', category: 'Utilities & Bills', date: getDateStr(0, 8), notes: 'Power & High-speed Fiber' },
    { id: 'tx_c6', title: 'Dinner with Team', amount: 94.20, type: 'expense', category: 'Dining Out', date: getDateStr(0, 10), notes: 'Bistro dinner' },
    { id: 'tx_c7', title: 'Gasoline', amount: 55.00, type: 'expense', category: 'Transportation', date: getDateStr(0, 12), notes: 'Full tank fuel' },
    { id: 'tx_c8', title: 'Streaming Services', amount: 32.99, type: 'expense', category: 'Subscriptions', date: getDateStr(0, 14), notes: 'Netflix & Spotify' },
    { id: 'tx_c9', title: 'Investment Dividend', amount: 210.00, type: 'income', category: 'Investments', date: getDateStr(0, 15), notes: 'Quarterly index payout' },
    { id: 'tx_c10', title: 'New Running Shoes', amount: 120.00, type: 'expense', category: 'Shopping', date: getDateStr(0, 16), notes: 'Sporting goods' },

    // Previous Month (-1 offset)
    { id: 'tx_p1_1', title: 'Monthly Salary', amount: 4500, type: 'income', category: 'Salary', date: getDateStr(-1, 1), notes: 'Primary Tech Corp Paycheck' },
    { id: 'tx_p1_2', title: 'Apartment Rent', amount: 1450, type: 'expense', category: 'Housing & Rent', date: getDateStr(-1, 2), notes: 'Monthly rent' },
    { id: 'tx_p1_3', title: 'Groceries Store', amount: 210.40, type: 'expense', category: 'Food & Groceries', date: getDateStr(-1, 5), notes: 'Pantry restocking' },
    { id: 'tx_p1_4', title: 'Car Maintenance', amount: 280.00, type: 'expense', category: 'Transportation', date: getDateStr(-1, 9), notes: 'Oil change & brakes' },
    { id: 'tx_p1_5', title: 'Freelance App Build', amount: 1200, type: 'income', category: 'Freelance', date: getDateStr(-1, 14), notes: 'Mobile app prototype' },
    { id: 'tx_p1_6', title: 'Concert Tickets', amount: 160.00, type: 'expense', category: 'Entertainment', date: getDateStr(-1, 18), notes: 'Live music show' },
    { id: 'tx_p1_7', title: 'Doctor Checkup', amount: 75.00, type: 'expense', category: 'Healthcare', date: getDateStr(-1, 22), notes: 'Annual checkup co-pay' },

    // 2 Months Ago (-2 offset)
    { id: 'tx_p2_1', title: 'Monthly Salary', amount: 4500, type: 'income', category: 'Salary', date: getDateStr(-2, 1), notes: 'Primary Tech Corp Paycheck' },
    { id: 'tx_p2_2', title: 'Apartment Rent', amount: 1450, type: 'expense', category: 'Housing & Rent', date: getDateStr(-2, 2), notes: 'Monthly rent' },
    { id: 'tx_p2_3', title: 'Groceries Store', amount: 195.00, type: 'expense', category: 'Food & Groceries', date: getDateStr(-2, 6), notes: 'Weekly groceries' },
    { id: 'tx_p2_4', title: 'Performance Bonus', amount: 1000, type: 'income', category: 'Gifts & Bonus', date: getDateStr(-2, 12), notes: 'Q1 achievement bonus' },
    { id: 'tx_p2_5', title: 'Utilities', amount: 145.00, type: 'expense', category: 'Utilities & Bills', date: getDateStr(-2, 15), notes: 'Water and electricity' },
    { id: 'tx_p2_6', title: 'Electronics Purchase', amount: 340.00, type: 'expense', category: 'Shopping', date: getDateStr(-2, 20), notes: 'Ergonomic monitor' },
  ];
};

const STORAGE_KEYS = {
  AUTH: 'budget_app_authenticated',
  CATEGORIES: 'budget_app_categories',
  TRANSACTIONS: 'budget_app_transactions',
};

// Storage helper functions
export const getAuthStatus = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
};

export const setAuthStatus = (status) => {
  localStorage.setItem(STORAGE_KEYS.AUTH, status ? 'true' : 'false');
};

export const verifyPasscode = (code) => {
  return code === CORRECT_PASSCODE;
};

export const getStoredCategories = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse categories from storage', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = (categories) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getStoredTransactions = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!data) {
    const initial = generateSeedTransactions();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse transactions from storage', e);
    const initial = generateSeedTransactions();
    return initial;
  }
};

export const saveStoredTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const resetDataToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  const seedTx = generateSeedTransactions();
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(seedTx));
  return { categories: DEFAULT_CATEGORIES, transactions: seedTx };
};
