// Multi-Device Cloud Synchronization Engine for Luxe Budget App
const GLOBAL_SYNC_ID = "ff808181a09d98f701a0fbb3666a5f58";
const GLOBAL_SYNC_URL = `https://api.restful-api.dev/objects/${GLOBAL_SYNC_ID}`;

let lastSyncedTimestamp = null;
const DELETED_IDS_KEY = 'luxe_budget_deleted_tx_ids';

export function getDeletedTxIds() {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordDeletedTxId(id) {
  const ids = getDeletedTxIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids.slice(-200)));
  }
}

// Validate remote data structure
export function isValidAppData(data) {
  if (!data || typeof data !== 'object') return false;
  const categories = data.categories;
  if (!categories || typeof categories !== 'object') return false;
  if (!Array.isArray(categories.income) || !Array.isArray(categories.expense)) return false;
  if (!Array.isArray(data.transactions)) return false;
  return true;
}

// Merge datasets respecting deleted transaction IDs
export function mergeTransactions(local = [], remote = []) {
  const deletedIds = new Set(getDeletedTxIds());
  const map = new Map();

  // Process local
  (local || []).forEach((tx) => {
    if (tx && tx.id && !deletedIds.has(tx.id)) {
      map.set(tx.id, tx);
    }
  });

  // Process remote
  (remote || []).forEach((tx) => {
    if (tx && tx.id && !deletedIds.has(tx.id)) {
      map.set(tx.id, tx);
    }
  });

  return Array.from(map.values());
}

export function mergeCategories(localCat, remoteCat) {
  const mergeCategoryList = (localList = [], remoteList = []) => {
    const map = new Map();
    localList.forEach(c => c && c.id && map.set(c.id, c));
    remoteList.forEach(c => c && c.id && map.set(c.id, c));
    return Array.from(map.values());
  };

  return {
    income: mergeCategoryList(localCat?.income, remoteCat?.income),
    expense: mergeCategoryList(localCat?.expense, remoteCat?.expense)
  };
}

// Fetch remote data
export async function fetchRemoteCloudData() {
  try {
    const res = await fetch(GLOBAL_SYNC_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data && isValidAppData(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[SyncEngine] Cloud fetch offline or network unavailable:', err.message);
  }
  return null;
}

// Push local data to global cloud endpoint
export async function pushLocalDataToCloud(categories, transactions) {
  if (!categories || !Array.isArray(categories.income) || !Array.isArray(categories.expense)) {
    return false;
  }

  const timestamp = new Date().toISOString();
  lastSyncedTimestamp = timestamp;

  const payload = {
    name: "Luxe Budget Shared Storage",
    data: {
      categories,
      transactions: Array.isArray(transactions) ? transactions : [],
      updatedAt: timestamp
    }
  };

  try {
    const res = await fetch(GLOBAL_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('[SyncEngine] Error pushing local data to cloud:', err.message);
  }
  return false;
}

// Initial Sync: Fetch remote first, merge local entries, update remote
export async function initializeCloudSync(localCategories, localTransactions) {
  const remote = await fetchRemoteCloudData();
  if (remote) {
    const mergedTx = mergeTransactions(localTransactions, remote.transactions);
    const mergedCat = mergeCategories(localCategories, remote.categories);
    // Push back merged view
    await pushLocalDataToCloud(mergedCat, mergedTx);
    return { categories: mergedCat, transactions: mergedTx };
  } else {
    // Remote is empty, push local
    await pushLocalDataToCloud(localCategories, localTransactions);
    return { categories: localCategories, transactions: localTransactions };
  }
}

// Subscriber to automatically fetch and merge multi-device updates
export function startCrossDeviceSyncSubscriber(getLocalState, onRemoteDataReceived) {
  let intervalId = null;

  const checkForUpdates = async () => {
    const remote = await fetchRemoteCloudData();
    const { categories: localCategories, transactions: localTransactions } = getLocalState();

    if (!remote) return;

    const mergedTx = mergeTransactions(localTransactions, remote.transactions);
    const mergedCat = mergeCategories(localCategories, remote.categories);

    if (!lastSyncedTimestamp || (remote.updatedAt && remote.updatedAt > lastSyncedTimestamp)) {
      lastSyncedTimestamp = remote.updatedAt;
      onRemoteDataReceived({
        categories: mergedCat,
        transactions: mergedTx
      });
    }
  };

  intervalId = setInterval(checkForUpdates, 3000);

  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  };

  window.addEventListener('visibilitychange', handleVisibilityOrFocus);
  window.addEventListener('focus', handleVisibilityOrFocus);

  return () => {
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    window.removeEventListener('focus', handleVisibilityOrFocus);
  };
}
