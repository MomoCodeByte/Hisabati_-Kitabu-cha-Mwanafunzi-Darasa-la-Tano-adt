(function () {
  "use strict";

  var overlay = null;
  var activeRange = null;
  var pageWords = null;
  var sourceMaps = null;

  function normalise(value) {
    var text = String(value || "").replace(/Ã—/g, "×").toLocaleLowerCase("sw-TZ").trim();
    var word = text.replace(/[^\p{L}\p{N}]+/gu, "");
    return word || text.replace(/[^×÷+=−.%]/gu, "");
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

  function indexedSourceWords(container) {
    var indexed = Array.from(container.querySelectorAll("[data-word-index]"));
    if (indexed.length) {
      return indexed.map(function (element) {
        return {
          index: Number(element.getAttribute("data-word-index")),
          text: normalise(element.textContent)
        };
      });
    }
    return String(container.textContent || "").split(/\s+/).filter(Boolean).map(function (word, index) {
      return { index: index, text: normalise(word) };
    });
  }

  function buildSourceMaps() {
    var entries = [];
    var maps = {};
    Array.from(document.querySelectorAll('[data-id*="_rb"]')).forEach(function (container) {
      var sourceId = container.getAttribute("data-id") || "";
      maps[sourceId] = {};
      indexedSourceWords(container).forEach(function (word) {
        entries.push({ sourceId: sourceId, index: word.index, text: word.text });
      });
    });

    var rows = entries.length;
    var columns = pageWords.length;
    var table = Array.from({ length: rows + 1 }, function () {
      return new Uint16Array(columns + 1);
    });
    for (var row = rows - 1; row >= 0; row -= 1) {
      for (var column = columns - 1; column >= 0; column -= 1) {
        if (entries[row].text && entries[row].text === pageWords[column].text) {
          table[row][column] = table[row + 1][column + 1] + 1;
        } else {
          table[row][column] = Math.max(table[row + 1][column], table[row][column + 1]);
        }
      }
    }

    var sourceCursor = 0;
    var pageCursor = 0;
    while (sourceCursor < rows && pageCursor < columns) {
      var source = entries[sourceCursor];
      if (source.text && source.text === pageWords[pageCursor].text) {
        maps[source.sourceId][source.index] = pageCursor;
        sourceCursor += 1;
        pageCursor += 1;
      } else if (table[sourceCursor + 1][pageCursor] >= table[sourceCursor][pageCursor + 1]) {
        sourceCursor += 1;
      } else {
        pageCursor += 1;
      }
    }
    return maps;
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
    if (!sourceMaps) sourceMaps = buildSourceMaps();
    var sourceWords = nativeWords(container);
    var sourceId = container.getAttribute("data-id") || "";
    var pageIndex = sourceMaps[sourceId] ? sourceMaps[sourceId][index] : undefined;
    var target = Number.isFinite(pageIndex) ? pageWords[pageIndex] : null;
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
      childList: true,
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
