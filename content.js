function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyRuleToText(text, rule, mode, ignoreCase) {
  if (!rule.from) return text;
  const escaped = escapeRegExp(rule.from);
  let flags = mode === "all" ? "g" : "";
  if (ignoreCase) flags += "i";
  const regex = new RegExp(escaped, flags);
  return text.replace(regex, rule.to ?? "");
}

function normalizeRule(rawRule) {
  if (!rawRule || typeof rawRule !== "object") return null;
  const from = typeof rawRule.from === "string" ? rawRule.from : "";
  const to = typeof rawRule.to === "string" ? rawRule.to : "";
  if (!from) return null;
  return { from, to };
}

function isReplaceableTarget(target) {
  if (!target) return false;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
  if (target.readOnly || target.disabled) return false;
  return true;
}

function countOccurrences(text, from, ignoreCase) {
  if (!from) return 0;
  const escaped = escapeRegExp(from);
  const regex = new RegExp(escaped, ignoreCase ? "gi" : "g");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function replaceInTarget(target, rule, mode, ignoreCase) {
  if (!isReplaceableTarget(target)) return 0;

  const before = target.value;
  const occurrenceCount = countOccurrences(before, rule.from, ignoreCase);
  if (occurrenceCount === 0) return 0;

  const nextValue = applyRuleToText(before, rule, mode, ignoreCase);
  if (nextValue === before) return 0;

  target.value = nextValue;
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));

  return mode === "all" ? occurrenceCount : 1;
}

function getReplaceTargets() {
  return document.querySelectorAll(
    [
      'input:not([type])',
      'input[type="text"]',
      'input[type="search"]',
      'input[type="email"]',
      'input[type="url"]',
      'input[type="tel"]',
      "textarea"
    ].join(",")
  );
}

const FOCUS_STORAGE_KEY = "rechrome-last-target";

let lastFocusedTarget = null;

function buildTargetSelector(target) {
  if (target.id) return `#${CSS.escape(target.id)}`;
  const name = target.getAttribute("name");
  if (name) {
    const tag = target.tagName.toLowerCase();
    return `${tag}[name="${CSS.escape(name)}"]`;
  }
  return null;
}

function restoreLastFocusedTarget() {
  try {
    const selector = sessionStorage.getItem(FOCUS_STORAGE_KEY);
    if (!selector) return;
    const element = document.querySelector(selector);
    if (isReplaceableTarget(element)) {
      lastFocusedTarget = element;
    }
  } catch {
    // Ignore storage access errors on restricted pages.
  }
}

function rememberFocusedTarget(target) {
  lastFocusedTarget = target;
  const selector = buildTargetSelector(target);
  if (!selector) return;
  try {
    sessionStorage.setItem(FOCUS_STORAGE_KEY, selector);
  } catch {
    // Ignore storage access errors on restricted pages.
  }
}

function getTargetsByScope(targetScope) {
  if (targetScope === "focused") {
    if (isReplaceableTarget(document.activeElement)) {
      return [document.activeElement];
    }
    return lastFocusedTarget ? [lastFocusedTarget] : [];
  }
  return Array.from(getReplaceTargets());
}

restoreLastFocusedTarget();

function replaceAll(rule, mode, targetScope, ignoreCase) {
  const targets = getTargetsByScope(targetScope);
  let changedCount = 0;
  let replacementCount = 0;
  for (const target of targets) {
    const replaced = replaceInTarget(target, rule, mode, ignoreCase);
    if (replaced <= 0) continue;
    changedCount += 1;
    replacementCount += replaced;
  }
  return {
    targetCount: targets.length,
    changedCount,
    replacementCount
  };
}

function previewReplace(rule, targetScope, ignoreCase) {
  const targets = getTargetsByScope(targetScope);
  let changedCount = 0;
  let replacementCount = 0;
  for (const target of targets) {
    if (!isReplaceableTarget(target)) continue;
    const count = countOccurrences(target.value, rule.from, ignoreCase);
    if (count <= 0) continue;
    changedCount += 1;
    replacementCount += count;
  }
  return {
    targetCount: targets.length,
    changedCount,
    replacementCount
  };
}

document.addEventListener(
  "focusin",
  (event) => {
    if (isReplaceableTarget(event.target)) {
      rememberFocusedTarget(event.target);
    }
  },
  true
);

if (!globalThis.__RECHROME_LISTENER_REGISTERED__) {
  globalThis.__RECHROME_LISTENER_REGISTERED__ = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "EXECUTE_REPLACE" && message?.type !== "PREVIEW_REPLACE") return;
    const rule = normalizeRule(message.rule);
    const mode = message.mode === "one" ? "one" : "all";
    const targetScope = message.targetScope === "focused" ? "focused" : "page";
    const ignoreCase = Boolean(message.ignoreCase);
    if (!rule) {
      sendResponse({ ok: false, error: "invalid rule" });
      return;
    }

    const result =
      message.type === "PREVIEW_REPLACE"
        ? previewReplace(rule, targetScope, ignoreCase)
        : replaceAll(rule, mode, targetScope, ignoreCase);
    sendResponse({ ok: true, ...result });
  });
}
