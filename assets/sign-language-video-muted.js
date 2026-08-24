(function () {
  "use strict";

  function silence(video) {
    if (!(video instanceof HTMLVideoElement)) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
  }

  document.addEventListener("play", function (event) {
    if (!(event.target instanceof HTMLVideoElement)) return;
    silence(event.target);
    event.stopImmediatePropagation();
    window.setTimeout(function () {
      var readAloudIsEnabled = document.querySelector('button[aria-label="Zima maandishi kwa sauti"]');
      var resumeTts = document.querySelector('button[aria-label="Cheza"]');
      var ttsIsPlaying = document.querySelector('button[aria-label="Sitisha"]');
      if (readAloudIsEnabled && resumeTts) {
        resumeTts.click();
      } else if (readAloudIsEnabled && !ttsIsPlaying) {
        readAloudIsEnabled.click();
      }
    }, 300);
  }, true);

  document.addEventListener("pause", function (event) {
    var video = event.target;
    if (!(video instanceof HTMLVideoElement) || video.ended) return;
    silence(video);
    window.setTimeout(function () {
      var ttsIsPlaying = document.querySelector('button[aria-label="Sitisha"]');
      var signIsEnabled = document.querySelector('button[aria-label="Lugha ya ishara"][aria-pressed="true"]');
      if (ttsIsPlaying && signIsEnabled && video.paused && !video.ended) {
        video.play().catch(function () {});
      }
    }, 80);
  }, true);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof Element)) return;
        if (node.matches("video")) silence(node);
        node.querySelectorAll("video").forEach(silence);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.querySelectorAll("video").forEach(silence);
}());
