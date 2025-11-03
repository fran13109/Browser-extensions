function calculateKeywordScore(item, keywords) {
  const title = (item.title || '').toLowerCase();
  const url = item.url.toLowerCase();
  
  let score = 0;
  
  keywords.forEach(keyword => {
    //Title matches are most valuable
    if (title.includes(keyword)) {
      score += 5;
      
      //For exact word match in title
      const titleWords = title.split(/\s+/);
      if (titleWords.includes(keyword)) {
        score += 3;
      }
    }
    
    //URL matches 
    if (url.includes(keyword)) {
      score += 2;
      
      //For domain or path segment match
      const urlParts = url.split(/[\/\-_\.]/);
      if (urlParts.includes(keyword)) {
        score += 1;
      }
    }
  });
  
  return score;
}
function calculateRecencyScore(lastVisitTime, maxAge) {
  const now = Date.now();
  const ageInMs = now - lastVisitTime;
  const ageInDays = ageInMs / (24 * 60 * 60 * 1000);
  
  
  const recencyScore = Math.max(0, 1 - (ageInDays / maxAge));
  
  return recencyScore;
}
export function scoreAndRank(items, keywords, maxAgeDays = 30) {
  if (!items || items.length === 0) return [];
  if (!keywords || keywords.length === 0) return [];
  
  //Score each item
  const scoredItems = items.map(item => {
    const keywordScore = calculateKeywordScore(item, keywords);
    const recencyScore = calculateRecencyScore(item.lastVisitTime, maxAgeDays);
    const totalScore = (keywordScore * 10) + recencyScore;
    
    return {
      ...item,
      scores: {
        keyword: keywordScore,
        recency: recencyScore,
        total: totalScore
      }
    };
  });
  
  //Filter out items with no keyword matches
  const matchedItems = scoredItems.filter(item => item.scores.keyword > 0);
  
  //Sorting by ttl score
  matchedItems.sort((a, b) => b.scores.total - a.scores.total);
  
  return matchedItems;
}
