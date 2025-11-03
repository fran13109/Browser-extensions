const STORAGE_KEYS = {
  SETTINGS: 'settings',
  LAST_SEARCH: 'lastSearch',
  STATS: 'stats'
};



export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
      resolve(result[STORAGE_KEYS.SETTINGS] || {
        retentionDays: 30,
        maxResults: 50
      });
    });
  });
}

export async function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      { [STORAGE_KEYS.SETTINGS]: settings },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      }
    );
  });
}

export async function saveLastSearch(searchData) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { 
        [STORAGE_KEYS.LAST_SEARCH]: {
          ...searchData,
          timestamp: Date.now()
        }
      },
      () => resolve()
    );
  });
}

export async function getLastSearch() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LAST_SEARCH], (result) => {
      resolve(result[STORAGE_KEYS.LAST_SEARCH] || null);
    });
  });
}

export async function clearAllData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}