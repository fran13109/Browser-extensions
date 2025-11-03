
//Extraction of the time from casual language input 
const TIME_PATTERNS = [

    {
        pattern:/\btoday\b/i,
        getDays: () => 1,
        label: 'today'
    },
    {
    pattern: /\byesterday\b/i,
    getDays: () => 2,
    label: 'yesterday'
    },
    {
        pattern: /\blast\s+week\b/i,
        getDays: () => 7,
        label: 'last week'
    },
    {
        pattern: /\bpast\s+week\b/i,
        getDays: () => 7,
        label: 'past week'
    },
    {
        pattern: /\blast\s+month\b/i,
        getDays: () => 30,
        label: 'last month'
    },
    {
        pattern: /(\d+)\s*days?\s+ago\b/i,
        getDays: (match) => parseInt(match[1]),
        label: (match) => `${match[1]} days ago`
    },
    {
        pattern: /(\d+)\s*weeks?\s+ago\b/i,
        getDays: (match) => parseInt(match[1]) * 7,
        label: (match) => `${match[1]} weeks ago`
    },
    {
        pattern: /(\d+)\s*months?\s+ago\b/i,
        getDays: (match) => parseInt(match[1]) * 30,
        label: (match) => `${match[1]} months ago`
    }
];

//Extraction of the time frm query

export function extractTimeframe(query) {
  for (const timePattern of TIME_PATTERNS) {
    const match = query.match(timePattern.pattern);
    if (match) {
      const days = typeof timePattern.getDays === 'function' 
        ? timePattern.getDays(match) 
        : timePattern.getDays;
      
      const label = typeof timePattern.label === 'function'
        ? timePattern.label(match)
        : timePattern.label;
      
      return {
        days,
        label,
        found: true,
        matchedText: match[0]
      };
    }
  }
  
  //Default: last 30 days
  return {
    days: 30,
    label: 'last 30 days',
    found: false,
    matchedText: null
  };
}

export function removeTimeExpression(query, matchedText) {
  if (!matchedText) return query;
  return query.replace(matchedText, '').trim();
}


