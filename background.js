const STORAGE_KEY = "popupState";

function isUnsupportedUrl(url) {
  if (!url) return true;
  return /^(chrome|edge|about|view-source|chrome-extension|devtools):/i.test(url);
}

async function sendReplace(tabId, payload) {
  return chrome.tabs.sendMessage(tabId, {
    type: "EXECUTE_REPLACE",
    ...payload
  });
}

async function ensureContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "replace-all-shortcut") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || isUnsupportedUrl(tab.url)) return;

  const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
  const rule = state?.lastRule;
  if (!rule?.from) return;

  const payload = {
    rule,
    mode: "all",
    targetScope: state?.targetScope === "focused" ? "focused" : "page",
    ignoreCase: Boolean(state?.ignoreCase)
  };

  try {
    await sendReplace(tab.id, payload);
  } catch (error) {
    if (!String(error?.message).includes("Receiving end does not exist")) return;
    await ensureContentScript(tab.id);
    await sendReplace(tab.id, payload);
  }
});
