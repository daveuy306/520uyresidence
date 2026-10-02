// Family Multi-Device Cloud Synchronization Engine for Luxe Budget App
// Dedicated Shared Cloud Storage Endpoint across all devices
const FAMILY_SYNC_ID = "ff808181a09d98f701a0fd4d71696348";
const FAMILY_SYNC_URL = `https://api.restful-api.dev/objects/${FAMILY_SYNC_ID}`;

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

// Validate remote data structure to ensure app stability
export function isValidAppData(data) {
  if (!data || typeof data !== 'object') return false;
  const categories = data.categories;
  if (!categories || typeof categories !== 'object') return false;
  if (!Array.isArray(categories.income) || !Array.isArray(categories.expense)) return false;
  if (!Array.isArray(data.transactions)) return false;
  return true;
}

// Fetch remote data from family cloud endpoint
export async function fetchRemoteCloudData() {
  try {
    const res = await fetch(FAMILY_SYNC_URL, {
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

// Push local data to family cloud endpoint so every device receives inputs instantly
export async function pushLocalDataToCloud(categories, transactions) {
  if (!categories || !Array.isArray(categories.income) || !Array.isArray(categories.expense)) {
    return false;
  }

  const timestamp = new Date().toISOString();
  lastSyncedTimestamp = timestamp;

  const payload = {
    name: "Luxe Family Shared Budget Storage",
    data: {
      categories,
      transactions: Array.isArray(transactions) ? transactions : [],
      updatedAt: timestamp
    }
  };

  try {
    const res = await fetch(FAMILY_SYNC_URL, {
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

// Atomic Cloud Mutation Helper:
// Fetches the live remote state, applies mutationFn, and uploads updated state to cloud
export async function mutateAndSyncCloudData(mutationFn, fallbackCategories, fallbackTransactions) {
  let liveCategories = fallbackCategories;
  let liveTransactions = fallbackTransactions;

  const remote = await fetchRemoteCloudData();
  if (remote && isValidAppData(remote)) {
    liveCategories = remote.categories;
    liveTransactions = remote.transactions;
  }

  const mutated = mutationFn(liveCategories, liveTransactions);
  if (mutated && mutated.categories && Array.isArray(mutated.transactions)) {
    await pushLocalDataToCloud(mutated.categories, mutated.transactions);
    return mutated;
  }
  return null;
}

// Initial Family Sync on startup/unlock: Remote cloud data is the single source of truth when present
export async function initializeCloudSync(localCategories, localTransactions) {
  const remote = await fetchRemoteCloudData();
  if (remote && isValidAppData(remote)) {
    // Shared cloud data is the primary truth across all family devices
    lastSyncedTimestamp = remote.updatedAt || new Date().toISOString();
    return {
      categories: remote.categories,
      transactions: remote.transactions
    };
  } else {
    // Cloud is uninitialized or offline, seed cloud with local data
    await pushLocalDataToCloud(localCategories, localTransactions);
    return { categories: localCategories, transactions: localTransactions };
  }
}

// Subscriber to automatically fetch multi-device updates across all family devices
export function startCrossDeviceSyncSubscriber(getLocalState, onRemoteDataReceived) {
  let intervalId = null;

  const checkForUpdates = async () => {
    const remote = await fetchRemoteCloudData();
    if (!remote || !isValidAppData(remote)) return;

    if (!lastSyncedTimestamp || (remote.updatedAt && remote.updatedAt > lastSyncedTimestamp)) {
      lastSyncedTimestamp = remote.updatedAt;
      onRemoteDataReceived({
        categories: remote.categories,
        transactions: remote.transactions
      });
    }
  };

  // Poll family cloud endpoint every 1.5 seconds for instant updates
  intervalId = setInterval(checkForUpdates, 1500);

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
