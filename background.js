const trafficLogs = [];

chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true,
    });

    // This must be called *immediately* after a user action
    chrome.sidePanel.open({ tabId: tab.id });
});

chrome.webRequest.onCompleted.addListener(
    (details) => {

        if (details.url.startsWith("chrome-extension://")) {
            return; // ignore internal extension traffic
        }
        
        const entry = {
            url: details.url,
            method: details.method,
            statusCode: details.statusCode,
            type: details.type,
            timeStamp: new Date(details.timeStamp).toLocaleTimeString(),
        };

        trafficLogs.push(entry);

        if (trafficLogs.length > 100) trafficLogs.shift();

        chrome.runtime.sendMessage({
            type: "NETWORK_LOG_UPDATE",
            payload: entry,
        });
    },
    { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_NETWORK_LOGS") {
        sendResponse({ logs: trafficLogs });
    }
});
