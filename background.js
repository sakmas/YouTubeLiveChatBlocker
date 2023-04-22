chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("power", result => {
    if (!result.power) {
      chrome.storage.local.set({ power: "on" });
    }
  });
  chrome.storage.local.get("rules", result => {
    if (!result.rules) {
      chrome.storage.local.set({ rules: [] });
    }
  });
});