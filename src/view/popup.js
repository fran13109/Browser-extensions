
console.log('🟢 Script loading...');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsList = document.getElementById('resultsList');
const resultsContainer = document.getElementById('resultsContainer');
const resultsInfo = document.getElementById('resultsInfo');
const resultCount = document.getElementById('resultCount');
const timeframeInfo = document.getElementById('timeframeInfo');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

console.log('✅ DOM elements loaded');


const TIME_PATTERNS = [
  { pattern: /\btoday\b/i, days: 1, label: 'today' },
  { pattern: /\byesterday\b/i, days: 2, label: 'yesterday' },
  { pattern: /\blast\s+week\b/i, days: 7, label: 'last week' },
  { pattern: /\bpast\s+week\b/i, days: 7, label: 'past week' },
  { pattern: /\blast\s+month\b/i, days: 30, label: 'last month' },
  { pattern: /(\d+)\s*days?\s+ago\b/i, extract: m => parseInt(m[1]), label: m => `${m[1]} days ago` },
  { pattern: /(\d+)\s*weeks?\s+ago\b/i, extract: m => parseInt(m[1]) * 7, label: m => `${m[1]} weeks ago` }
];

function extractTimeframe(query) {
  for (const p of TIME_PATTERNS) {
    const match = query.match(p.pattern);
    if (match) {
      const days = p.extract ? p.extract(match) : p.days;
      const label = typeof p.label === 'function' ? p.label(match) : p.label;
      return { days, label, matchedText: match[0] };
    }
  }
  return { days: 30, label: 'last 30 days', matchedText: null };
}


const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'show', 'find', 'get', 'saw', 'read', 'i', 'me', 'my', 'that', 'this'
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function parseQuery(query) {
  const timeframe = extractTimeframe(query);
  const cleanedQuery = query.replace(timeframe.matchedText || '', '').trim();
  const keywords = extractKeywords(cleanedQuery);
  return { keywords, timeframe, valid: keywords.length > 0 };
}


function scoreResults(items, keywords) {
  return items.map(item => {
    let score = 0;
    const title = (item.title || '').toLowerCase();
    const url = item.url.toLowerCase();

    keywords.forEach(kw => {
      if (title.includes(kw)) score += 5;
      if (url.includes(kw)) score += 2;
      if (title.split(/\s+/).includes(kw)) score += 3;
    });

    return { ...item, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);
}

function showState(state) {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  resultsInfo.classList.add('hidden');

  if (state === 'empty') emptyState.classList.remove('hidden');
  else if (state === 'loading') loadingState.classList.remove('hidden');
  else if (state === 'error') errorState.classList.remove('hidden');
  else if (state === 'results') {
    resultsContainer.classList.remove('hidden');
    resultsInfo.classList.remove('hidden');
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function renderResults(results, metadata) {
  resultsList.innerHTML = '';
  resultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
  timeframeInfo.textContent = `from ${metadata.timeframe.label}`;

  results.forEach(item => {
    const li = document.createElement('li');
    li.className = 'result-item';
    
    const link = document.createElement('a');
    link.className = 'result-link';
    link.href = item.url;
    link.textContent = item.title || item.url;
    link.target = '_blank';
    
    const urlDiv = document.createElement('div');
    urlDiv.className = 'result-url';
    urlDiv.textContent = getDomain(item.url);
    
    const meta = document.createElement('div');
    meta.className = 'result-meta';
    
    const score = document.createElement('span');
    score.className = 'result-score';
    score.textContent = `Score: ${item.score}`;
    
    const date = document.createElement('span');
    date.textContent = formatDate(item.lastVisitTime);
    
    meta.appendChild(score);
    meta.appendChild(date);
    
    li.appendChild(link);
    li.appendChild(urlDiv);
    li.appendChild(meta);

    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Delete this history item';
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); 
      try {
        await chrome.history.deleteUrl({ url: item.url });
        li.remove();
      } catch (err) {
        console.error('Error deleting history item:', err);
        alert('Failed to delete history item.');
      }
    });
    
    li.appendChild(deleteBtn);
    

    li.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') link.click();
    });

    resultsList.appendChild(li);
  });

  showState('results');
}


function showError(msg) {
  errorMessage.textContent = msg;
  showState('error');
}

async function performSearch() {
  console.log('🔵 Search started');
  
  const query = searchInput.value.trim();
  if (!query) {
    showError('Please enter a search query');
    return;
  }

  showState('loading');
  searchBtn.disabled = true;

  try {
    const parsed = parseQuery(query);
    console.log('Parsed:', parsed);

    if (!parsed.valid) {
      showError('No searchable keywords found');
      searchBtn.disabled = false;
      return;
    }

    const startTime = Date.now() - (parsed.timeframe.days * 24 * 60 * 60 * 1000);

    chrome.history.search({ text: '', startTime, maxResults: 1000 }, (items) => {
      console.log(`Found ${items.length} history items`);

      const scored = scoreResults(items, parsed.keywords).slice(0, 50);
      console.log(`Scored: ${scored.length} matches`);

      if (scored.length === 0) {
        showError('No matches found. Try different keywords.');
      } else {
        renderResults(scored, parsed);
      }

      searchBtn.disabled = false;
    });

  } catch (error) {
    console.error('Error:', error);
    showError(`Error: ${error.message}`);
    searchBtn.disabled = false;
  }
}


searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});


showState('empty');
searchInput.focus();
console.log('✅ Ready!');