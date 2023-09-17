const Preview = (function () {
  const targetPixelsPerBeat = 50;
  const maxNoteHeight = 180;

  let previewCanvas;

  /** Render the preview */
  function display() {
    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCanvas.width = Math.min(
      MidiToNotes.calculatedEndpoint * targetPixelsPerBeat,
      32767
    );

    drawBars(ctx);

    const { startColor, endColor } = Inputs.readColors();
    for (const note of MidiToNotes.notes) {
      drawNote(note, 6.5, "black", "black", ctx);
    }
    for (const note of MidiToNotes.notes) {
      drawNote(note, 4, startColor, endColor, ctx);
    }
  }

  /** Draw the lines at the top, bottom, and bars */
  function drawBars(ctx) {
    const { calculatedEndpoint } = MidiToNotes;

    ctx.lineWidth = 1;

    ctx.strokeStyle = "#ddd";
    ctx.beginPath();
    for (let i = 1; i < calculatedEndpoint; i++) {
      ctx.moveTo(...transformPosition([i, -165]));
      ctx.lineTo(...transformPosition([i, 165]));
    }
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(...transformPosition([0, -165]));
    ctx.lineTo(...transformPosition([calculatedEndpoint, -165]));
    ctx.moveTo(...transformPosition([0, 0]));
    ctx.lineTo(...transformPosition([calculatedEndpoint, 0]));
    ctx.moveTo(...transformPosition([0, 165]));
    ctx.lineTo(...transformPosition([calculatedEndpoint, 165]));
    ctx.moveTo(...transformPosition([0, -165]));
    ctx.lineTo(...transformPosition([0, 165]));
    ctx.moveTo(...transformPosition([calculatedEndpoint, -165]));
    ctx.lineTo(...transformPosition([calculatedEndpoint, 165]));
    ctx.stroke();
  }

  /** Draw one note */
  function drawNote(note, width, startColor, endColor, ctx) {
    const [startTime, length, startPitch, pitchChange, endPitch] = note;

    const startLocation = transformPosition([startTime, startPitch]);
    const endLocation = transformPosition([startTime + length, endPitch]);

    const grad = ctx.createLinearGradient(...startLocation, ...endLocation);
    grad.addColorStop(0, startColor);
    grad.addColorStop(1, endColor);
    ctx.strokeStyle = grad;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(...startLocation);
    if (pitchChange === 0) {
      ctx.lineTo(...endLocation);
    } else {
      const midX = (startLocation[0] + endLocation[0]) / 2;
      ctx.bezierCurveTo(
        midX,
        startLocation[1],
        midX,
        endLocation[1],
        ...endLocation
      );
    }
    ctx.stroke();
  }

  /** Convert a coordinate of the form [beat, tc height] to [canvas x, canvas y] */
  function transformPosition(coord) {
    const pixelsPerBeat = Math.min(
      targetPixelsPerBeat,
      previewCanvas.width / MidiToNotes.calculatedEndpoint
    );
    const [x, y] = coord;
    return [
      x * pixelsPerBeat,
      ((-y + maxNoteHeight) / (maxNoteHeight * 2)) * previewCanvas.height,
    ];
  }

  Init.register(function () {
    previewCanvas = document.getElementById("preview");

    // Make note color changes refresh the preview
    document
      .getElementById("notestartcolor")
      .addEventListener("change", display);
    document.getElementById("noteendcolor").addEventListener("change", display);
  });

  return { display };
})();
