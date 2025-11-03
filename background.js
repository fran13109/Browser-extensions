
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Chat with Browser History installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  
  switch(message.action) {
    case 'ping':
      sendResponse({ status: 'pong' });
      break;
    default:
      sendResponse({ status: 'unknown action' });
  }
  
  return true; 
});

console.log('Background service worker running');