function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyRuleToText(text, rule, mode) {
  if (!rule.from) return text;
  const escaped = escapeRegExp(rule.from);
  const regex = new RegExp(escaped, mode === "all" ? "g" : "");
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

function countOccurrences(text, from) {
  if (!from) return 0;
  return text.split(from).length - 1;
}

function replaceInTarget(target, rule, mode) {
  if (!isReplaceableTarget(target)) return 0;

  const before = target.value;
  const occurrenceCount = countOccurrences(before, rule.from);
  if (occurrenceCount === 0) return 0;

  const nextValue = applyRuleToText(before, rule, mode);
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

function replaceAll(rule, mode) {
  const targets = getReplaceTargets();
  let changedCount = 0;
  let replacementCount = 0;
  for (const target of targets) {
    const replaced = replaceInTarget(target, rule, mode);
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

if (!globalThis.__RECHROME_LISTENER_REGISTERED__) {
  globalThis.__RECHROME_LISTENER_REGISTERED__ = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "EXECUTE_REPLACE") return;
    const rule = normalizeRule(message.rule);
    const mode = message.mode === "one" ? "one" : "all";
    if (!rule) {
      sendResponse({ ok: false, error: "invalid rule" });
      return;
    }

    const result = replaceAll(rule, mode);
    sendResponse({ ok: true, ...result });
  });
}
