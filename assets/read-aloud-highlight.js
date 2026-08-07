(function () {
  "use strict";

  var activeElement = null;
  var audioByFile = null;
  var timecodes = null;
  var currentId = null;
  var currentCandidates = [];
  var lastWordIndex = -1;
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
    lastWordIndex = -1;
  }

  function setHighlight(element) {
    if (element === activeElement) return;
    clearHighlight();
    if (!element) return;
    element.classList.add("adt-read-highlight");
    activeElement = element;
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
    return scored.filter(function (item) {
      return item.score >= 1000 || Math.abs(item.index - best.index) <= 4;
    }).sort(function (a, b) { return a.index - b.index; });
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

  function update(media) {
    if (!currentId || media.paused || media.ended) return;
    var stamps = timestampsFor(currentId);
    if (!stamps.length || !currentCandidates.length) return;
    var time = Number(media.currentTime) || 0;
    var wordIndex = stamps.findIndex(function (stamp) {
      return time >= Number(stamp.start) && time < Number(stamp.end);
    });
    if (wordIndex < 0) wordIndex = Math.max(0, stamps.findLastIndex(function (stamp) { return time >= Number(stamp.start); }));
    if (wordIndex === lastWordIndex) return;
    lastWordIndex = wordIndex;
    var word = normalise(stamps[wordIndex] && stamps[wordIndex].text);
    var match = currentCandidates.find(function (item) {
      return word && item.text.split(" ").includes(word);
    });
    setHighlight((match || currentCandidates[0]).span);
  }

  function begin(media) {
    Promise.all([audioByFile, timecodes]).then(function (values) {
      var map = values[0] || {};
      timecodes = values[1] || {};
      var file = filename(media.currentSrc || media.src);
      currentId = map[file] || null;
      currentCandidates = currentId ? visibleSpansFor(currentId) : [];
      update(media);
    });
  }

  function clockTime() {
    return clockElapsed + (clockRunning ? (Date.now() - clockStartedAt) / 1000 : 0);
  }

  function clockTick() {
    if (!clockRunning) return;
    update({ paused: false, ended: false, currentTime: clockTime() });
    animationFrame = window.requestAnimationFrame(clockTick);
  }

  function startClock() {
    clockElapsed = 0;
    clockStartedAt = Date.now();
    clockRunning = true;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(clockTick);
  }

  function pauseClock() {
    if (!clockRunning) return;
    clockElapsed = clockTime();
    clockRunning = false;
    window.cancelAnimationFrame(animationFrame);
  }

  function resumeClock() {
    if (clockRunning || !currentId) return;
    clockStartedAt = Date.now();
    clockRunning = true;
    animationFrame = window.requestAnimationFrame(clockTick);
  }

  function stopClock() {
    clockRunning = false;
    clockElapsed = 0;
    window.cancelAnimationFrame(animationFrame);
    clearHighlight();
  }

  function beginFromUrl(url) {
    var file = filename(url);
    if (!/\.mp3$/i.test(file)) return;
    Promise.all([audioByFile, Promise.resolve(timecodes)]).then(function (values) {
      var id = (values[0] || {})[file];
      if (!id) return;
      timecodes = values[1] || {};
      currentId = id;
      currentCandidates = visibleSpansFor(id);
      document.documentElement.setAttribute("data-adt-highlight-audio", file);
      startClock();
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
    else if (label.includes("endelea") || label === "cheza" || label === "play") resumeClock();
  }, true);

  var controlsObserver = new MutationObserver(function () {
    if (document.querySelector('button[aria-label="Sitisha"],button[aria-label="Pause"]')) resumeClock();
  });
  controlsObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label"] });

  var style = document.createElement("style");
  style.id = "adt-read-aloud-highlight-style";
  style.textContent = ".pdf-text.adt-read-highlight{background:rgba(255,224,64,.64)!important;box-shadow:0 0 0 .18em rgba(255,224,64,.35);border-radius:.14em;transition:background-color .12s linear,box-shadow .12s linear}";
  document.head.appendChild(style);

  if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    window.__adtHighlightPreview = function (id, atTime) {
      return Promise.resolve(timecodes).then(function (loadedTimecodes) {
        timecodes = loadedTimecodes || {};
        currentId = id;
        currentCandidates = visibleSpansFor(id);
        update({ paused: false, ended: false, currentTime: Number(atTime) || 0 });
        return activeElement ? activeElement.textContent : null;
      });
    };
  }
}());
