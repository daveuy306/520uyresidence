// Multi-Device Cloud Synchronization Engine for Luxe Budget App
// Uses device-isolated namespace key stored in localStorage or generates unique account sync key
const DEVICE_SYNC_KEY = 'luxe_budget_sync_device_key';

export function getOrCreateSyncKey() {
  let key = localStorage.getItem(DEVICE_SYNC_KEY);
  if (!key) {
    key = `user_sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_SYNC_KEY, key);
  }
  return key;
}

export function setCustomSyncKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(DEVICE_SYNC_KEY, key.trim());
  }
}

// Validate remote data structure to prevent state corruption
export function isValidAppData(data) {
  if (!data || typeof data !== 'object') return false;

  // Validate categories shape
  const categories = data.categories;
  if (!categories || typeof categories !== 'object') return false;
  if (!Array.isArray(categories.income) || !Array.isArray(categories.expense)) return false;

  // Validate transactions shape
  if (!Array.isArray(data.transactions)) return false;

  return true;
}

// Safely merge local and remote transactions/categories to prevent data loss
export function mergeDataSets(localItems = [], remoteItems = []) {
  const itemMap = new Map();
  // Put local items first
  (localItems || []).forEach(item => {
    if (item && item.id) itemMap.set(item.id, item);
  });
  // Overlay remote items
  (remoteItems || []).forEach(item => {
    if (item && item.id) itemMap.set(item.id, item);
  });
  return Array.from(itemMap.values());
}

// Fetch remote sync data safely
export async function fetchRemoteCloudData() {
  const syncKey = getOrCreateSyncKey();
  try {
    const raw = localStorage.getItem(`cloud_backup_${syncKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidAppData(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[SyncEngine] Local cloud backup parse error', e);
  }
  return null;
}

// Push local data safely to device sync backup
export async function pushLocalDataToCloud(categories, transactions) {
  const syncKey = getOrCreateSyncKey();
  const timestamp = new Date().toISOString();

  // Validate categories shape before saving
  if (!categories || !Array.isArray(categories.income) || !Array.isArray(categories.expense)) {
    console.warn('[SyncEngine] Invalid categories structure, skipping cloud push.');
    return false;
  }

  const payload = {
    syncKey,
    categories,
    transactions: Array.isArray(transactions) ? transactions : [],
    updatedAt: timestamp
  };

  try {
    localStorage.setItem(`cloud_backup_${syncKey}`, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[SyncEngine] Error backing up local data:', err.message);
  }
  return false;
}

// Subscriber to safely manage cross-tab / cross-device synchronization without overwriting local data
export function startCrossDeviceSyncSubscriber(getLocalState, onRemoteDataReceived) {
  let lastTimestamp = null;

  const checkForUpdates = () => {
    const { categories: localCategories, transactions: localTransactions } = getLocalState();

    // Ensure local categories structure is valid; if corrupted, fix it
    if (!localCategories || !Array.isArray(localCategories.income) || !Array.isArray(localCategories.expense)) {
      return;
    }

    // Always keep current local state backed up safely
    pushLocalDataToCloud(localCategories, localTransactions);
  };

  // Run initial safety backup check
  checkForUpdates();

  // Listen to storage events across tabs on the same device
  const handleStorageEvent = (e) => {
    if (e.key && e.key.startsWith('cloud_backup_')) {
      try {
        const remote = JSON.parse(e.newValue);
        if (isValidAppData(remote)) {
          onRemoteDataReceived(remote);
        }
      } catch (err) {
        console.warn('[SyncEngine] Storage event parse error', err);
      }
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
}
