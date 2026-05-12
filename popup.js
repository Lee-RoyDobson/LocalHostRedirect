document.addEventListener("DOMContentLoaded", () => {
  const enableToggle = document.getElementById("enableToggle");
  const statusText = document.getElementById("statusText");
  const interceptHost = document.getElementById("interceptHost");
  const targetServer = document.getElementById("targetServer");
  const saveButton = document.getElementById("saveButton");
  const saveMessage = document.getElementById("saveMessage");

  // Load existing settings
  chrome.storage.local.get(
    ["enabled", "interceptHost", "targetServer"],
    (result) => {
      enableToggle.checked = result.enabled || false;
      statusText.textContent = enableToggle.checked ? "On" : "Off";
      interceptHost.value = result.interceptHost || "10.0.10.193";
      targetServer.value = result.targetServer || "localhost:3000";
    },
  );

  enableToggle.addEventListener("change", () => {
    statusText.textContent = enableToggle.checked ? "On" : "Off";
    chrome.storage.local.set({ enabled: enableToggle.checked });
  });

  saveButton.addEventListener("click", () => {
    const settings = {
      interceptHost: interceptHost.value.trim(),
      targetServer: targetServer.value.trim(),
    };

    // Strip http/https from inputs just in case user added them
    settings.interceptHost = settings.interceptHost
      .replace(/^(https?:\/\/)/, "")
      .split("/")[0];
    settings.targetServer = settings.targetServer
      .replace(/^(https?:\/\/)/, "")
      .split("/")[0];

    // update fields to show cleansed values
    interceptHost.value = settings.interceptHost;
    targetServer.value = settings.targetServer;

    chrome.storage.local.set(settings, () => {
      saveMessage.classList.remove("hidden");
      setTimeout(() => {
        saveMessage.classList.add("hidden");
      }, 2000);
    });
  });
});
