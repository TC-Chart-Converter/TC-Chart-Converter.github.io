const Import = (function () {
  /** Data entry fields */
  let importMetadataFileInput;

  async function importFromPrevious() {
    if (!importMetadataFileInput.value) {
      alert("Please ensure a chart is uploaded");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(importMetadataFileInput.files[0]);
    return new Promise(function (resolve) {
      reader.addEventListener(
        "load",
        function (event) {
          const obj = JSON.parse(event.target.result);
          Inputs.writeInputs(obj);
          resolve();
        },
        { once: true }
      );
    });
  }

  Init.register(function () {
    importMetadataFileInput = document.getElementById("importmetadatafile");
    document
      .getElementById("importmetadatabutton")
      .addEventListener("click", importFromPrevious);
  });

  return {};
})();
