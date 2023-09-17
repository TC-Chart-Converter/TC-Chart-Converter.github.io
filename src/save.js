const Save = (function () {
  /** Downloads the chart as song.tmb */
  function save(chart) {
    _save("song.tmb", stringifyWithRounding(chart));
  }

  /**
   * Stringify some json but round all the floats to at most
   * 8 significant digits, the most a float can have.
   */
  function stringifyWithRounding(data) {
    return JSON.stringify(data, function (key, value) {
      if (typeof value === "number") {
        return Number(value.toPrecision(8));
      }
      return value;
    });
  }

  /**
   * Downloads the string as a json file
   * https://stackoverflow.com/a/33542499
   */
  function _save(filename, str) {
    const blob = new Blob([str], { type: "application/json" });
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const elem = document.createElement("a");
      elem.href = URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
      setTimeout(function () {
        URL.revokeObjectURL(elem.href);
      }, 1000);
    }
  }

  return { save };
})();
