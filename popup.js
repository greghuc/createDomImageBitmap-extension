console.log('Injecting content script');
chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
    chrome.scripting.executeScript(
        {
            target: {tabId: tab.id},
            files: ['content.js'],
        })
});