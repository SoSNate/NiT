// Real-time synchronization utility for NiT Desktop & Mobile Companion

export interface SyncState {
  courseId: string;
  moduleId: string;
  subtopicId: string;
  params?: Record<string, any>;
}

const CHANNEL_NAME = 'nit-sync';
let syncChannel: BroadcastChannel | null = null;

try {
  syncChannel = new BroadcastChannel(CHANNEL_NAME);
} catch (e) {
  console.warn('BroadcastChannel not supported or blocked, falling back to localStorage sync', e);
}

export function broadcastState(state: SyncState) {
  // Save to localStorage so mobile can pick it up on load
  localStorage.setItem('nit_sync_state', JSON.stringify({ ...state, timestamp: Date.now() }));
  
  if (syncChannel) {
    try {
      syncChannel.postMessage(state);
    } catch (e) {
      console.error('Error broadcasting state:', e);
    }
  }
}

export function subscribeToState(callback: (state: SyncState) => void): () => void {
  const handleMessage = (event: MessageEvent) => {
    callback(event.data);
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handleMessage);
  }

  // Also listen to storage events (cross-tab fallback)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'nit_sync_state' && event.newValue) {
      try {
        const state = JSON.parse(event.newValue);
        callback(state);
      } catch (e) {
        // Ignore parsing errors
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  // Return unsubscribe cleanup function
  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export function getInitialSyncState(): SyncState | null {
  const raw = localStorage.getItem('nit_sync_state');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
