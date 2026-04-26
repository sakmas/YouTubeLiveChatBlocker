chrome.runtime.onInstalled.addListener(async () => {
  const { power, rules } = await chrome.storage.local.get(["power", "rules"]);
  if (!power) {
    await chrome.storage.local.set({ power: "on" });
  }
  if (!rules) {
    await chrome.storage.local.set({ rules: [] });
  }
});