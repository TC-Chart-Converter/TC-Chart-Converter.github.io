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

    if (inputs.tempo <= 0) {
      alert("Please ensure BPM is greater than zero.");
      return;
    }

    // Chart tempo is now finalized, so calculate the time in seconds for any bg events
    for (const bgEvent of MidiToNotes.bgEvents) {
      bgEvent[0] = bgEvent[2] * (60.0 / inputs.tempo);
    }

    const chart = {
      ...inputs,
      notes: MidiToNotes.notes,
      lyrics: MidiToNotes.lyrics,
      improv_zones: MidiToNotes.improvZones,
      bgdata: MidiToNotes.bgEvents,
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
