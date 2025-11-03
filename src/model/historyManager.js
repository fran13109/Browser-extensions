export async function fetchHistory(daysBack =30) {
  const startTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  
  return new Promise((resolve, reject) => {
    chrome.history.search(
      {
        text: '',          
        startTime: startTime,
        maxResults: 2000    
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(results || []);
        }
      }
    );
  });
}

export async function getVisitCount(url) {
  return new Promise((resolve) => {
    chrome.history.getVisits({ url }, (visits) => {
      resolve(visits ? visits.length : 0);
    });
  });
}

export async function searchHistory({ keywords, daysBack = 30 }) {
  try {
    const items = await fetchHistory(daysBack);
    
    //If no keywords, return all items in timeframe
    if (!keywords || keywords.length === 0) {
      return items;
    }
    
    //Basic filtering 
    //(Chrome API doesn't support keyword search well)
    return items.filter(item => {
      const title = (item.title || '').toLowerCase();
      const url = item.url.toLowerCase();
      
      //If ANY keyword is found
      return keywords.some(keyword => 
        title.includes(keyword) || url.includes(keyword)
      );
    });
  } catch (error) {
    console.error('Error searching history:', error);
    throw error;
  }
}