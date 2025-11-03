import { extractTimeframe,removeTimeExpression } from "./timeExtractor";    

const STOP_WORDS = ([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'about', 'into', 'through',
  'show', 'find', 'get', 'saw', 'read', 'see', 'look', 'looking',
  'i', 'me', 'my', 'mine', 'that', 'this', 'these', 'those', 'it',
  'its', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
  'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how'
]);

function extractKeywords(text) {
    return text
        .toLowerCase()
        .split(/\s+/)
        .replace(/[^\w\s]/g, ' ')
        .filter(word => word.length > 2)
        .filter(word => !STOP_WORDS.has(word))
        .filter(word => !/^\d+$/.test(word)); 
}

export function parseQuery(query) {
    if (!query || typeof query !== 'string') {
        return {
            keywords: [],
            timeframe: {
                days: 30,
                label: 'last 30 days',
                found: false
            },
        originalQuery: '',
      valid: false
    };
  }
  const trimmedQuery = query.trim();
  const timeframe = extractTimeframe(trimmedQuery);
  const cleanedQuery = removeTimeExpression(trimmedQuery, timeframe.matchedText);
  const keywords = extractKeywords(cleanedQuery);
    return {

        keywords,
        timeframe,
        originalQuery: trimmedQuery,
        cleanedQuery,
        valid: keywords.length > 0
    };



}