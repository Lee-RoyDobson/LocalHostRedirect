let isEnabled = false;
let interceptHost = "10.0.10.193";
let targetServer = "localhost:3000";

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#1f8b4c" : "#7a1f1f",
  });
}

// Initialize defaults from storage
chrome.storage.local.get(
  ["enabled", "interceptHost", "targetServer"],
  (result) => {
    if (result.enabled !== undefined) isEnabled = result.enabled;
    if (result.interceptHost) interceptHost = result.interceptHost;
    if (result.targetServer) targetServer = result.targetServer;
    updateBadge(isEnabled);
  },
);

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    if (changes.enabled !== undefined) {
      isEnabled = changes.enabled.newValue;
      updateBadge(isEnabled);
    }
    if (changes.interceptHost) interceptHost = changes.interceptHost.newValue;
    if (changes.targetServer) targetServer = changes.targetServer.newValue;
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-enabled") return;

  isEnabled = !isEnabled;
  updateBadge(isEnabled);
  chrome.storage.local.set({ enabled: isEnabled });
});

// Intercept navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!isEnabled || details.frameId !== 0) return; // Only process root frames (main page loads) if enabled

  try {
    const url = new URL(details.url);

    if (url.host === interceptHost || url.hostname === interceptHost) {
      // Build the new URL with the target server while keeping the pathname and search params
      const targetProtocol = url.protocol; // keep http: or https:, though mostly it will be http: for local/IPs
      const newUrl = `${targetProtocol}//${targetServer}${url.pathname}${url.search}${url.hash}`;

      // Update the tab to redirect immediately
      chrome.tabs.update(details.tabId, { url: newUrl });
    }
  } catch (e) {
    console.error("Error parsing URL inside Redirector extension:", e);
  }
});
