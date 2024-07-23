chrome.action.onClicked.addListener((tab) => {
    console.log('Action button clicked');

    // Inject the content script into the active tab
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            files: ['content.js'],
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error('Error executing content script:', chrome.runtime.lastError.message);
            } else {
                console.log('Content script executed successfully.');

            }
        }
    );
});
  