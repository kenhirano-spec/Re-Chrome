const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const recentRuleSelect = document.getElementById("recentRule");
const targetScopeSelect = document.getElementById("targetScope");
const ignoreCaseCheckbox = document.getElementById("ignoreCase");
const previewButton = document.getElementById("previewButton");
const replaceOneButton = document.getElementById("replaceOneButton");
const replaceAllButton = document.getElementById("replaceAllButton");
const statusElement = document.getElementById("status");
const versionInfoElement = document.getElementById("versionInfo");
const STORAGE_KEY = "popupState";
const MAX_RECENT_RULES = 3;

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
    mode,
    targetScope: targetScopeSelect.value,
    ignoreCase: ignoreCaseCheckbox.checked
  });
}

async function sendPreviewMessage(tabId, rule) {
  return chrome.tabs.sendMessage(tabId, {
    type: "PREVIEW_REPLACE",
    rule,
    targetScope: targetScopeSelect.value,
    ignoreCase: ignoreCaseCheckbox.checked
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

function normalizeRecentRules(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item.from === "string" && item.from.trim())
    .map((item) => ({
      from: item.from.trim(),
      to: typeof item.to === "string" ? item.to : ""
    }))
    .slice(0, MAX_RECENT_RULES);
}

function renderRecentRules(recentRules) {
  recentRuleSelect.innerHTML = '<option value="">選択してください</option>';
  recentRules.forEach((rule, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = `${rule.from} → ${rule.to}`;
    recentRuleSelect.appendChild(option);
  });
}

async function loadState() {
  const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
  const recentRules = normalizeRecentRules(state?.recentRules);

  if (state?.lastRule?.from) {
    fromInput.value = state.lastRule.from;
    toInput.value = state.lastRule.to ?? "";
  } else {
    fromInput.value = "よろしくお願いします";
    toInput.value = "よろしくお願いいたします";
  }
  targetScopeSelect.value = state?.targetScope === "focused" ? "focused" : "page";
  ignoreCaseCheckbox.checked = Boolean(state?.ignoreCase);
  renderRecentRules(recentRules);
}

async function persistState(rule) {
  const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
  const existing = normalizeRecentRules(state?.recentRules);
  const deduped = existing.filter((item) => !(item.from === rule.from && item.to === rule.to));
  const recentRules = [rule, ...deduped].slice(0, MAX_RECENT_RULES);

  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      recentRules,
      lastRule: rule,
      targetScope: targetScopeSelect.value,
      ignoreCase: ignoreCaseCheckbox.checked
    }
  });
  renderRecentRules(recentRules);
}

function validateRule() {
  try {
    const from = fromInput.value.trim();
    if (!from) throw new Error("置換前は必須です。");
    return { from, to: toInput.value };
  } catch (error) {
    setStatus(error.message, true);
    return null;
  }
}

async function withTab(handler) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("タブが取得できませんでした。");
  if (isUnsupportedUrl(tab.url)) {
    throw new Error("このページでは実行できません。通常のWebページで実行してください。");
  }
  await ensureContentScript(tab);
  return handler(tab);
}

async function executeReplace(mode, modeLabel) {
  const rule = validateRule();
  if (!rule) return;
  try {
    const response = await withTab((tab) => sendReplaceMessage(tab.id, rule, mode));
    if (!response?.ok) {
      throw new Error("実行に失敗しました。");
    }
    if (targetScopeSelect.value === "focused" && response.targetCount === 0) {
      setStatus("選択中テキストボックスが見つかりません。入力欄をクリックしてから再実行してください。", true);
      return;
    }
    await persistState(rule);
    setStatus(
      `${modeLabel}: ${response.targetCount}件中 ${response.changedCount}件を置換（合計${response.replacementCount}箇所）`
    );
  } catch (error) {
    setStatus(`実行失敗: ${error.message}`, true);
  }
}

async function previewReplace() {
  const rule = validateRule();
  if (!rule) return;
  try {
    const response = await withTab((tab) => sendPreviewMessage(tab.id, rule));
    if (!response?.ok) throw new Error("件数確認に失敗しました。");
    setStatus(`件数確認: ${response.targetCount}件中 ${response.changedCount}件（合計${response.replacementCount}箇所）`);
  } catch (error) {
    setStatus(`件数確認失敗: ${error.message}`, true);
  }
}

recentRuleSelect.addEventListener("change", async () => {
  if (recentRuleSelect.value === "") return;
  const idx = Number(recentRuleSelect.value);
  if (Number.isNaN(idx)) return;
  const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
  const recentRules = normalizeRecentRules(state?.recentRules);
  const selected = recentRules[idx];
  if (!selected) return;
  fromInput.value = selected.from;
  toInput.value = selected.to;
});

previewButton.addEventListener("click", previewReplace);
replaceOneButton.addEventListener("click", () => {
  executeReplace("one", "1個ずつ置換");
});

replaceAllButton.addEventListener("click", () => {
  executeReplace("all", "全部置換");
});

targetScopeSelect.addEventListener("change", () => setStatus(""));
ignoreCaseCheckbox.addEventListener("change", () => setStatus(""));
loadState().catch((error) => setStatus(`初期化失敗: ${error.message}`, true));
versionInfoElement.textContent = `v${chrome.runtime.getManifest().version}`;
