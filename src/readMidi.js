const ReadMidi = (function () {
  let midiFileInput;

  /** Read the file into a Uint8Array */
  async function readFileToBytes() {
    const reader = new FileReader();
    reader.readAsArrayBuffer(midiFileInput.files[0]);
    return new Promise(function (resolve) {
      reader.addEventListener(
        "load",
        function (event) {
          resolve(new Uint8Array(event.target.result));
        },
        { once: true }
      );
    });
  }

  async function parseMidi() {
    const midi = MidiParser.parse(await readFileToBytes());
    MidiToNotes.generateNotes(midi);
  }

  Init.register(function () {
    midiFileInput = document.getElementById("midifile");
    midiFileInput.addEventListener("change", parseMidi);

    if (midiFileInput.value) parseMidi();
  });

  return {};
})();
