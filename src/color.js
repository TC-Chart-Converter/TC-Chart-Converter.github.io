const Color = (function () {
  let noteStartColor;
  let noteStartColorText;
  let noteEndColor;
  let noteEndColorText;

  /** Converts "#xxxxxx" to [float, float, float] */
  function hexToFloats(hexColor) {
    const rInt = parseInt(hexColor.substring(1, 3), 16);
    const gInt = parseInt(hexColor.substring(3, 5), 16);
    const bInt = parseInt(hexColor.substring(5, 7), 16);
    return [rInt / 255, gInt / 255, bInt / 255];
  }

  /** Converts [float, float, float] to "#xxxxxx" */
  function floatsToHex(floats) {
    return '#' + floats.map((f) => {
      const hex = Math.round(f * 255).toString(16);
      return hex.length === 2 ? hex : '0' + hex;
    }).join("");
  }

  Init.register(function () {
    noteStartColor = document.getElementById("notestartcolor");
    noteStartColorText = document.getElementById("notestartcolortext");
    noteEndColor = document.getElementById("noteendcolor");
    noteEndColorText = document.getElementById("noteendcolortext");

    // The color inputs are authoritative, initialize the texts to match them
    noteStartColorText.value = noteStartColor.value;
    noteEndColorText.value = noteEndColor.value;

    // Synchronize color and text fields
    noteStartColor.addEventListener("change", function () {
      if (noteStartColorText.value !== noteStartColor.value)
        noteStartColorText.value = noteStartColor.value;
    });
    noteStartColorText.addEventListener("change", function () {
      if (
        noteStartColorText.value.match(/^#[0-9a-f]{6}$/i) &&
        noteStartColor.value !== noteStartColorText.value
      ) {
        noteStartColor.value = noteStartColorText.value;
        noteStartColor.dispatchEvent(new Event("change"));
      }
    });
    noteEndColor.addEventListener("change", function () {
      if (noteEndColorText.value !== noteEndColor.value)
        noteEndColorText.value = noteEndColor.value;
    });
    noteEndColorText.addEventListener("change", function () {
      if (
        noteEndColorText.value.match(/^#[0-9a-f]{6}$/i) &&
        noteEndColor.value !== noteEndColorText.value
      ) {
        noteEndColor.value = noteEndColorText.value;
        noteEndColor.dispatchEvent(new Event("change"));
      }
    });
  });

  return { hexToFloats, floatsToHex };
})();
