const Generate = (function () {
  const generateWarnings = new Warnings("generatewarnings");

  /** Entrypoint: read the midi, generate the chart, and save it */
  async function generate() {
    generateWarnings.clear();

    if (!Inputs.verifyInputs() || MidiToNotes.notes.length === 0) {
      alert(
        "Please ensure a valid midi is uploaded and all fields are filled\n" +
          "(Song Endpoint can be empty)"
      );
      return;
    }

    const inputs = Inputs.readInputs(generateWarnings);

    const chart = {
      ...inputs,
      notes: MidiToNotes.notes,
      lyrics: MidiToNotes.lyrics,
      improv_zones: MidiToNotes.improvZones,
      trackRef: (inputs.prefixTrackRef ? Math.random().toString().substring(2) + '_' : '') + inputs.trackRef,
      prefixTrackRef: undefined,
      endpoint: inputs.endpoint || MidiToNotes.calculatedEndpoint,
      UNK1: 0,
    };
    generateWarnings.display();
    Save.save(chart);
  }

  Init.register(function () {
    document
      .getElementById("generatechart")
      .addEventListener("click", generate);
  });

  return {};
})();
