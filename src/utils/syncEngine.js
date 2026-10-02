// Multi-Device Cloud Synchronization Engine for Luxe Budget App
// Shared Cloud Storage Endpoint across all devices
const GLOBAL_STORAGE_ID = "ff808181a09d98f701a0fb946c785ef7";
const GLOBAL_SYNC_URL = `https://api.restful-api.dev/objects/${GLOBAL_STORAGE_ID}`;

let lastSyncedTimestamp = null;

// Fetch latest data from global cloud storage
export async function fetchRemoteCloudData() {
  try {
    const res = await fetch(GLOBAL_SYNC_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('[SyncEngine] Cloud fetch offline or network unavailable:', err.message);
    return null;
  }
}

// Push local category & transaction updates to global cloud storage
export async function pushLocalDataToCloud(categories, transactions) {
  const timestamp = new Date().toISOString();
  lastSyncedTimestamp = timestamp;

  const payload = {
    name: "Luxe Budget Global Storage",
    data: {
      categories,
      transactions,
      updatedAt: timestamp
    }
  };

  try {
    const res = await fetch(GLOBAL_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('[SyncEngine] Error pushing local data to cloud:', err.message);
  }
  return false;
}

// Subscribe to real-time changes across devices (polling every 4 seconds & on tab focus)
export function startCrossDeviceSyncSubscriber(onRemoteDataReceived) {
  let intervalId = null;

  const checkForUpdates = async () => {
    const remote = await fetchRemoteCloudData();
    if (remote && remote.categories && remote.transactions) {
      // If remote timestamp is newer or we haven't synced yet
      if (!lastSyncedTimestamp || (remote.updatedAt && remote.updatedAt > lastSyncedTimestamp)) {
        lastSyncedTimestamp = remote.updatedAt;
        onRemoteDataReceived(remote);
      }
    }
  };

  // Initial check
  checkForUpdates();

  // Poll every 4 seconds for updates from other devices
  intervalId = setInterval(checkForUpdates, 4000);

  // Sync immediately when switching back to tab/app (mobile & desktop)
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
