(function () {
  "use strict";

  var activeElement = null;
  var audioByFile = null;
  var timecodes = null;
  var currentId = null;
  var currentCandidates = [];
  var lastWordIndex = -1;

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
