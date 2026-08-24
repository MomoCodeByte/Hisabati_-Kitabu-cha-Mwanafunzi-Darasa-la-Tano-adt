(function () {
  "use strict";

  var preferredSpeed = 0.85;
  var migrationKey = "adt-accessible-audio-speed-v1";

  try {
    if (window.localStorage.getItem(migrationKey) !== String(preferredSpeed)) {
      window.localStorage.setItem("audioSpeed", JSON.stringify(preferredSpeed));
      window.localStorage.setItem(migrationKey, String(preferredSpeed));
    }
  } catch (_error) {
    // The player will use its built-in default when browser storage is unavailable.
  }
})();
