(function () {
  "use strict";

  var overlay = null;
  var activeRange = null;
  var pageWords = null;
  var sourceStarts = null;

  function normalise(value) {
    return String(value || "")
      .toLocaleLowerCase("sw-TZ")
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .trim();
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("span");
    overlay.id = "adt-native-word-highlight";
    overlay.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.appendChild(overlay);
    return overlay;
  }

  function collectPageWords() {
    var words = [];
    Array.from(document.querySelectorAll(".pdf-text")).forEach(function (element) {
      var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        var matcher = /\S+/g;
        var match;
        while ((match = matcher.exec(node.nodeValue || ""))) {
          var text = normalise(match[0]);
          if (!text) continue;
          var range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          words.push({ text: text, range: range });
        }
      }
    });
    return words;
  }

  function nativeWords(container) {
    return Array.from(container.querySelectorAll("[data-word-index]")).map(function (element) {
      return normalise(element.textContent);
    });
  }

  function bestSequenceStart(sourceWords, visibleWords, minimumStart) {
    if (!sourceWords.length) return -1;
    var bestStart = -1;
    var bestScore = 0;
    visibleWords.forEach(function (word, start) {
      if (start < (minimumStart || 0)) return;
      if (word.text !== sourceWords[0]) return;
      var score = 0;
      for (var i = 0; i < sourceWords.length && start + i < visibleWords.length; i += 1) {
        if (visibleWords[start + i].text === sourceWords[i]) score += 1;
        else break;
      }
      if (score > bestScore) {
        bestScore = score;
        bestStart = start;
      }
    });
    return bestStart;
  }

  function textWords(container) {
    return String(container.textContent || "").split(/\s+/).map(normalise).filter(Boolean);
  }

  function buildSourceStarts() {
    var starts = {};
    var cursor = 0;
    Array.from(document.querySelectorAll('[data-id*="_rb"]')).forEach(function (container) {
      var words = textWords(container);
      var start = bestSequenceStart(words, pageWords, cursor);
      if (start < 0) start = bestSequenceStart(words, pageWords, 0);
      if (start >= 0) {
        starts[container.getAttribute("data-id") || ""] = start;
        cursor = start + words.length;
      }
    });
    return starts;
  }

  function positionOverlay() {
    if (!activeRange) return;
    var rect = activeRange.getBoundingClientRect();
    var marker = ensureOverlay();
    if (!rect.width || !rect.height) {
      marker.hidden = true;
      return;
    }
    marker.hidden = false;
    marker.style.left = rect.left + "px";
    marker.style.top = rect.top + "px";
    marker.style.width = rect.width + "px";
    marker.style.height = rect.height + "px";
  }

  function hideOverlay() {
    activeRange = null;
    if (overlay) overlay.hidden = true;
  }

  function syncFromPlayer() {
    var spoken = document.querySelector('[data-id*="_rb"] [data-word-index].bg-yellow-300');
    if (!spoken) {
      hideOverlay();
      return;
    }
    var container = spoken.closest('[data-id*="_rb"]');
    var index = Number(spoken.getAttribute("data-word-index"));
    if (!container || !Number.isFinite(index)) return;
    if (!pageWords) pageWords = collectPageWords();
    if (!sourceStarts) sourceStarts = buildSourceStarts();
    var sourceWords = nativeWords(container);
    var sourceId = container.getAttribute("data-id") || "";
    var start = Object.prototype.hasOwnProperty.call(sourceStarts, sourceId)
      ? sourceStarts[sourceId]
      : bestSequenceStart(sourceWords, pageWords, 0);
    var target = start >= 0 ? pageWords[start + index] : null;
    if (!target || target.text !== sourceWords[index]) {
      hideOverlay();
      return;
    }
    activeRange = target.range;
    var marker = ensureOverlay();
    marker.dataset.word = target.text;
    marker.dataset.source = sourceId;
    marker.dataset.wordIndex = String(index);
    positionOverlay();
  }

  var observer = new MutationObserver(syncFromPlayer);
  Array.from(document.querySelectorAll('[data-id*="_rb"]')).forEach(function (container) {
    observer.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  window.addEventListener("resize", positionOverlay);
  window.addEventListener("scroll", positionOverlay, true);

  var style = document.createElement("style");
  style.id = "adt-native-word-highlight-style";
  style.textContent = "#adt-native-word-highlight{position:fixed;z-index:40;pointer-events:none;background:rgba(168,85,247,.48);box-shadow:0 0 0 .12em rgba(126,34,206,.25);border-radius:.12em;transition:left .05s linear,top .05s linear,width .05s linear,height .05s linear}";
  document.head.appendChild(style);
}());
