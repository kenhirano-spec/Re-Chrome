const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const replaceOneButton = document.getElementById("replaceOneButton");
const replaceAllButton = document.getElementById("replaceAllButton");
const statusElement = document.getElementById("status");
const versionInfoElement = document.getElementById("versionInfo");

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

function isUnsupportedUrl(url) {
  if (!url) return true;
  return /^(chrome|edge|about|view-source|chrome-extension|devtools):/i.test(url);
}

async function sendReplaceMessage(tabId, rule, mode) {
  return chrome.tabs.sendMessage(tabId, {
    type: "EXECUTE_REPLACE",
    rule,
    mode
  });
}

async function ensureContentScript(tab) {
  if (!tab?.id) throw new Error("タブが取得できませんでした。");
  if (isUnsupportedUrl(tab.url)) {
    throw new Error("このページでは実行できません。通常のWebページで実行してください。");
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (error) {
    throw new Error(`スクリプト注入に失敗しました: ${error.message}`);
  }
}

async function executeReplace(mode, modeLabel) {
  try {
    const from = fromInput.value.trim();
    const to = toInput.value;

    if (!from) {
      setStatus("置換前は必須です。", true);
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus("タブが取得できませんでした。", true);
      return;
    }

    const rule = { from, to };
    let response;

    try {
      response = await sendReplaceMessage(tab.id, rule, mode);
    } catch (error) {
      if (!String(error?.message).includes("Receiving end does not exist")) {
        throw error;
      }
      await ensureContentScript(tab);
      response = await sendReplaceMessage(tab.id, rule, mode);
    }

    if (!response?.ok) {
      setStatus("実行に失敗しました。", true);
      return;
    }

    setStatus(
      `${modeLabel}: ${response.targetCount}件中 ${response.changedCount}件を置換（合計${response.replacementCount}箇所）`
    );
  } catch (error) {
    setStatus(`実行失敗: ${error.message}`, true);
  }
}

replaceOneButton.addEventListener("click", () => {
  executeReplace("one", "1個ずつ置換");
});

replaceAllButton.addEventListener("click", () => {
  executeReplace("all", "全部置換");
});

fromInput.value = "よろしくお願いします";
toInput.value = "よろしくお願いいたします";
versionInfoElement.textContent = `v${chrome.runtime.getManifest().version}`;
