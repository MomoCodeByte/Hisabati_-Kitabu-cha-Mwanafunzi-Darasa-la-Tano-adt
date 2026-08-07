(function () {
  "use strict";

  var activeElement = null;
  var audioByFile = null;
  var timecodes = null;
  var currentId = null;
  var currentCandidates = [];
  var currentWords = [];
  var lastWordIndex = -1;
  var activeWord = null;
  var highlightOverlay = null;
  var clockStartedAt = 0;
  var clockElapsed = 0;
  var clockRunning = false;
  var animationFrame = 0;

  function normalise(value) {
    return String(value || "")
      .toLocaleLowerCase("sw-TZ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function clearHighlight() {
    if (activeElement) activeElement.classList.remove("adt-read-highlight");
    activeElement = null;
    activeWord = null;
    if (highlightOverlay) highlightOverlay.hidden = true;
    lastWordIndex = -1;
  }

  function setHighlight(element) {
    if (element === activeElement) return;
    clearHighlight();
    if (!element) return;
    element.classList.add("adt-read-highlight");
    activeElement = element;
  }

  function ensureOverlay() {
    if (highlightOverlay) return highlightOverlay;
    highlightOverlay = document.createElement("span");
    highlightOverlay.id = "adt-read-word-highlight";
    highlightOverlay.setAttribute("aria-hidden", "true");
    highlightOverlay.hidden = true;
    document.body.appendChild(highlightOverlay);
    return highlightOverlay;
  }

  function positionActiveWord() {
    if (!activeWord) return;
    var rect = activeWord.range.getBoundingClientRect();
    var overlay = ensureOverlay();
    if (!rect.width || !rect.height) {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    overlay.style.left = rect.left + "px";
    overlay.style.top = rect.top + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
  }

  function setWordHighlight(word) {
    activeWord = word || null;
    if (!activeWord) {
      if (highlightOverlay) highlightOverlay.hidden = true;
      return;
    }
    ensureOverlay().dataset.word = activeWord.text;
    positionActiveWord();
  }

  function filename(url) {
    try {
      return decodeURIComponent(new URL(url, document.baseURI).pathname.split("/").pop() || "");
    } catch (_) {
      return String(url || "").split(/[\\/]/).pop().split(/[?#]/)[0];
    }
  }

  function visibleSpansFor(id) {
    var source = Array.from(document.querySelectorAll("[data-id]")).find(function (element) {
      return element.getAttribute("data-id") === id && element.closest("[data-rebuild-legacy-ids]");
    });
    if (!source) source = Array.from(document.querySelectorAll("[data-id]")).find(function (element) {
      return element.getAttribute("data-id") === id;
    });
    if (!source) return [];
    var target = normalise(source.textContent);
    if (!target) return [];
    var targetWords = new Set(target.split(" "));
    var spans = Array.from(document.querySelectorAll(".pdf-text"));
    var scored = spans.map(function (span, index) {
      var text = normalise(span.textContent);
      var words = text ? text.split(" ") : [];
      var overlap = words.filter(function (word) { return targetWords.has(word); }).length;
      var exact = text && (target.includes(text) || text.includes(target));
      return { span: span, index: index, text: text, score: exact ? 1000 + overlap : overlap };
    }).filter(function (item) { return item.score > 0; });
    if (!scored.length) return [];
    var best = scored.reduce(function (a, b) { return b.score > a.score ? b : a; });
    var exact = scored.filter(function (item) { return item.score >= 1000; });
    return (exact.length ? exact : scored.filter(function (item) {
      return Math.abs(item.index - best.index) <= 4;
    })).sort(function (a, b) { return a.index - b.index; });
  }

  function wordRangesFor(candidates) {
    var words = [];
    candidates.forEach(function (item) {
      var walker = document.createTreeWalker(item.span, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        var matcher = /\S+/g;
        var match;
        while ((match = matcher.exec(node.nodeValue || ""))) {
          var range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          words.push({ range: range, text: normalise(match[0]) });
        }
      }
    });
    return words;
  }

  function timestampsFor(id) {
    var entry = timecodes && timecodes[id];
    if (!entry || !Array.isArray(entry.timecodes)) return [];
    for (var i = 0; i < entry.timecodes.length; i += 1) {
      var block = entry.timecodes[i];
      if (block && Array.isArray(block.word_timestamps)) return block.word_timestamps;
    }
    return [];
  }

  function resolveAudioId(file, map) {
    if (map[file] && timestampsFor(map[file]).length) return map[file];
    var directId = file.replace(/\.mp3$/i, "");
    var source = document.querySelector('[data-id="' + directId.replace(/"/g, '\\"') + '"]');
    if (!source) return null;
    if (timestampsFor(directId).length) return directId;
    var sourceText = normalise(source.textContent);
    if (!sourceText) return null;
    var sourceWords = new Set(sourceText.split(" "));
    var bestId = null;
    var bestScore = 0;
    Array.from(document.querySelectorAll("[data-id]")).forEach(function (element) {
      var id = element.getAttribute("data-id");
      if (!id || id === directId || !timestampsFor(id).length) return;
      var text = normalise(element.textContent);
      if (!text) return;
      var overlap = text.split(" ").filter(function (word) { return sourceWords.has(word); }).length;
      var score = (text === sourceText ? 10000 : (text.includes(sourceText) || sourceText.includes(text) ? 1000 : 0)) + overlap;
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    });
    return bestId;
  }

  function update(media) {
    if (!currentId || media.paused || media.ended) return;
    var stamps = timestampsFor(currentId);
    if (!stamps.length || !currentCandidates.length) return;
    var time = Number(media.currentTime) || 0;
    var wordIndex = stamps.findIndex(function (stamp) {
      return time >= Number(stamp.start) && time < Number(stamp.end);
    });
    if (wordIndex < 0) wordIndex = Math.max(0, stamps.findLastIndex(function (stamp) { return time >= Number(stamp.start); }));
    document.documentElement.setAttribute("data-adt-highlight-id", currentId);
    document.documentElement.setAttribute("data-adt-highlight-time", time.toFixed(2));
    document.documentElement.setAttribute("data-adt-highlight-word-index", String(wordIndex));
    if (wordIndex === lastWordIndex) {
      positionActiveWord();
      return;
    }
    lastWordIndex = wordIndex;
    var word = normalise(stamps[wordIndex] && stamps[wordIndex].text);
    var match = currentWords[wordIndex];
    if (!match || (word && match.text !== word)) {
      match = currentWords.find(function (item, index) {
        return item.text === word && Math.abs(index - wordIndex) <= 5;
      }) || match;
    }
    setWordHighlight(match);
  }

  function begin(media) {
    Promise.all([audioByFile, timecodes]).then(function (values) {
      var map = values[0] || {};
      timecodes = values[1] || {};
      var file = filename(media.currentSrc || media.src);
      currentId = map[file] || null;
      currentCandidates = currentId ? visibleSpansFor(currentId) : [];
      currentWords = wordRangesFor(currentCandidates);
      update(media);
    });
  }

  function clockTime() {
    return clockElapsed + (clockRunning ? (Date.now() - clockStartedAt) / 1000 : 0);
  }

  function clockTick() {
    if (!clockRunning) return;
    update({ paused: false, ended: false, currentTime: clockTime() });
    animationFrame = window.setTimeout(clockTick, 40);
  }

  function startClock() {
    clockElapsed = 0;
    clockStartedAt = Date.now();
    clockRunning = true;
    window.clearTimeout(animationFrame);
    animationFrame = window.setTimeout(clockTick, 40);
  }

  function pauseClock() {
    if (!clockRunning) return;
    clockElapsed = clockTime();
    clockRunning = false;
    window.clearTimeout(animationFrame);
  }

  function resumeClock() {
    if (clockRunning || !currentId) return;
    clockStartedAt = Date.now();
    clockRunning = true;
    animationFrame = window.setTimeout(clockTick, 40);
  }

  function stopClock() {
    clockRunning = false;
    clockElapsed = 0;
    window.clearTimeout(animationFrame);
    clearHighlight();
  }

  function beginFromUrl(url) {
    var file = filename(url);
    if (!/\.mp3$/i.test(file)) return;
    Promise.all([audioByFile, Promise.resolve(timecodes)]).then(function (values) {
      timecodes = values[1] || {};
      var id = resolveAudioId(file, values[0] || {});
      if (!id) return;
      currentId = id;
      document.documentElement.setAttribute("data-adt-resolved-id", id);
      currentCandidates = visibleSpansFor(id);
      currentWords = wordRangesFor(currentCandidates);
      document.documentElement.setAttribute("data-adt-resolved-words", String(currentWords.length));
      document.documentElement.setAttribute("data-adt-highlight-audio", file);
      if (document.querySelector('button[aria-label="Sitisha"],button[aria-label="Pause"]')) {
        startClock();
      } else {
        clockElapsed = 0;
        clockRunning = false;
        window.clearTimeout(animationFrame);
        clearHighlight();
        window.setTimeout(function () {
          if (currentId === id && document.querySelector('button[aria-label="Sitisha"],button[aria-label="Pause"]')) {
            startClock();
          }
        }, 150);
      }
    });
  }

  var audioMapPromise = fetch("./content/i18n/sw-TZ/audios.json")
    .then(function (response) { return response.json(); })
    .then(function (map) {
      var reverse = {};
      Object.keys(map).forEach(function (id) { reverse[filename(map[id])] = id; });
      return reverse;
    }).catch(function () { return {}; });
  audioByFile = audioMapPromise;

  timecodes = fetch("./content/i18n/sw-TZ/timecode/timecode_output.json")
    .then(function (response) { return response.json(); })
    .catch(function () { return {}; });

  var originalFetch = window.fetch;
  window.fetch = function (input) {
    var requestUrl = typeof input === "string" ? input : input && input.url;
    if (requestUrl) beginFromUrl(requestUrl);
    return originalFetch.apply(this, arguments);
  };

  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (url) beginFromUrl(url);
    return originalOpen.apply(this, arguments);
  };

  if (window.PerformanceObserver) {
    try {
      var resourceObserver = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) { beginFromUrl(entry.name); });
      });
      resourceObserver.observe({ type: "resource", buffered: true });
    } catch (_) {}
  }

  var originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (this instanceof HTMLAudioElement) begin(this);
    return originalPlay.apply(this, arguments);
  };

  document.addEventListener("play", function (event) {
    if (event.target instanceof HTMLAudioElement) begin(event.target);
  }, true);
  document.addEventListener("timeupdate", function (event) {
    if (event.target instanceof HTMLAudioElement) update(event.target);
  }, true);
  document.addEventListener("pause", function (event) {
    if (event.target instanceof HTMLAudioElement) clearHighlight();
  }, true);
  document.addEventListener("ended", function (event) {
    if (event.target instanceof HTMLAudioElement) clearHighlight();
  }, true);

  document.addEventListener("click", function (event) {
    var button = event.target && event.target.closest && event.target.closest("button[aria-label]");
    if (!button) return;
    var label = normalise(button.getAttribute("aria-label"));
    if (label === "sitisha" || label === "pause") pauseClock();
    else if (label === "simamisha" || label === "stop") stopClock();
    else if (label.includes("endelea") || label === "cheza" || label === "play") {
      resumeClock();
      window.setTimeout(resumeClock, 200);
    }
  }, true);

  var controlsObserver = new MutationObserver(function () {
    if (document.querySelector('button[aria-label="Sitisha"],button[aria-label="Pause"]')) resumeClock();
  });
  controlsObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label"] });

  window.setInterval(function () {
    var playing = !!document.querySelector('button[aria-label="Sitisha"],button[aria-label="Pause"]');
    document.documentElement.setAttribute("data-adt-clock-state", playing + ":" + clockRunning + ":" + !!currentId);
    if (playing && currentId && !clockRunning) resumeClock();
    else if (!playing && clockRunning) pauseClock();
    if (playing && currentId) update({ paused: false, ended: false, currentTime: clockTime() });
  }, 100);

  var style = document.createElement("style");
  style.id = "adt-read-aloud-highlight-style";
  style.textContent = "#adt-read-word-highlight{position:fixed;z-index:40;pointer-events:none;background:rgba(168,85,247,.48);box-shadow:0 0 0 .12em rgba(126,34,206,.25);border-radius:.12em;transition:left .06s linear,top .06s linear,width .06s linear,height .06s linear}";
  document.head.appendChild(style);

  if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    window.__adtHighlightPreview = function (id, atTime) {
      return Promise.resolve(timecodes).then(function (loadedTimecodes) {
        timecodes = loadedTimecodes || {};
        currentId = id;
        currentCandidates = visibleSpansFor(id);
        currentWords = wordRangesFor(currentCandidates);
        update({ paused: false, ended: false, currentTime: Number(atTime) || 0 });
        return activeWord ? activeWord.text : null;
      });
    };
  }
}());
