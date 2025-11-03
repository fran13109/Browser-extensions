import { parseQuery } from '../utils/queryParser.js';
import { scoreAndRank } from '../utils/scorer.js';
import { searchHistory } from '../model/historyManager.js';
import { getSettings, saveLastSearch } from '../model/storageManager.js';



export async function executeSearch(query) {
  
  
  
    //Validate input
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      success: false,
      error: 'Please enter a search query',
      results: []
    };
  }
  
  try {
    //Parse query
    const parsed = parseQuery(query);
    
    if (!parsed.valid || parsed.keywords.length === 0) {
      return {
        success: false,
        error: 'No searchable keywords found. Try adding specific terms.',
        results: [],
        parsed
      };
    }
    
    console.log('Parsed query:', parsed);
    
    //Get user settings
    const settings = await getSettings();
    
    //Search the user's history of the browser
    const items = await searchHistory({
      keywords: parsed.keywords,
      daysBack: parsed.timeframe.days
    });
    
    console.log(`Found ${items.length} history items in range`);
    
    //Score and rank results
    //Score is mainly for "debbuging" it makes easier see how the words match with the results
    const rankedResults = scoreAndRank(
      items,
      parsed.keywords,
      parsed.timeframe.days
    );
    
    //Limit results
    const limitedResults = rankedResults.slice(0, settings.maxResults);
    
    //Save search for analytics
    await saveLastSearch({
      query: parsed.originalQuery,
      keywords: parsed.keywords,
      timeframe: parsed.timeframe,
      resultCount: limitedResults.length
    });
    
    //Returning results
    return {
      success: true,
      results: limitedResults,
      metadata: {
        query: parsed.originalQuery,
        keywords: parsed.keywords,
        timeframe: parsed.timeframe,
        totalFound: rankedResults.length,
        showing: limitedResults.length
      }
    };
    
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: `Search failed: ${error.message}`,
      results: []
    };
  }
}
export async function getSearchStats() {
  try {
    const settings = await getSettings();
    return {
      retentionDays: settings.retentionDays,
      maxResults: settings.maxResults
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}