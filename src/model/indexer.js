import { fetchHistory } from './historyManager.js';

function buildIndex(items) {
  const index = {
    byKeyword: new Map(),  
    byId: new Map(),       
    metadata: {
      itemCount: items.length,
      lastBuilt: Date.now()
    }
  };

  items.forEach((item, idx) => {
    const itemId = `${item.url}_${item.lastVisitTime}`;
    
    //Store item by ID
    index.byId.set(itemId, { ...item, _id: itemId });
    
    //Extract and index keywords from title and URL
    const title = (item.title || '').toLowerCase();
    const url = item.url.toLowerCase();
    
    const words = [...title.split(/\s+/), ...url.split(/[\/\-_\.]/)];
    
    words.forEach(word => {
      if (word.length > 2) {
        if (!index.byKeyword.has(word)) {
          index.byKeyword.set(word, []);
        }
        index.byKeyword.get(word).push(itemId);
      }
    });
  });
  
  return index;
}


export function searchIndex(index, keywords) {
  if (!index || !keywords || keywords.length === 0) return [];
  
  const matchedIds = new Set();
  
  keywords.forEach(keyword => {
    const ids = index.byKeyword.get(keyword.toLowerCase());
    if (ids) {
      ids.forEach(id => matchedIds.add(id));
    }
  });
  
  //Convert IDs to items
  return Array.from(matchedIds).map(id => index.byId.get(id));
}

export async function createIndex(daysBack = 30) {
  try {
    const items = await fetchHistory(daysBack);
    const index = buildIndex(items);
    console.log(`Index built: ${index.metadata.itemCount} items`);
    return index;
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
}