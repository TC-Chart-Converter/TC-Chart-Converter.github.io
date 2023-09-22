const MidiToNotes = (function () {
  /** Length of a note (in beats) that would otherwise have 0 length */
  const defaultNoteLength = 0.2;

  const midiWarnings = new Warnings("midiwarnings");

  /** Convert the midi to the notes array */
  function generateNotes(midi) {
    console.log(midi);
    MidiToNotes.notes = [];
    MidiToNotes.pitchBendEvents = [];
    midiWarnings.clear();

    const { timeDivision } = midi;

    /** All the events in the midi file, sorted by time */
    const sortedMidiEvents = getSortedMidiEvents(midi);

    collectPitchBendEvents(sortedMidiEvents, timeDivision);
    generateWarnings(sortedMidiEvents, timeDivision);

    // Calculate endpoint
    for (let i = sortedMidiEvents.length - 1; i >= 0; i--) {
      const eventType = getEventType(sortedMidiEvents[i]);
      if (eventType === "noteOff") {
        MidiToNotes.calculatedEndpoint =
          Math.ceil((sortedMidiEvents[i].time - 1) / timeDivision) + 4;
        break;
      }
    }
    Inputs.inputs["songendpoint"].placeholder = MidiToNotes.calculatedEndpoint;

    if (Settings.getSetting("slidemidi2tc")) {
      generateNotesMidi2Tc(sortedMidiEvents, timeDivision);
    } else if (Settings.getSetting("slidetccc")) {
      generateNotesTccc(sortedMidiEvents, timeDivision);
    } else {
      midiWarnings.add("Unknown slide type", {});
    }

    generateLyrics(sortedMidiEvents, timeDivision);

    midiWarnings.display();
    Preview.display();
  }

  function getEventType(event) {
    if (event.type === 8 || (event.type === 9 && event.data[1] === 0)) {
      return "noteOff";
    } else if (event.type === 9) {
      return "noteOn";
    } else if (event.type === 14) {
      return "pitchBend";
    } else if (event.type === 255) {
      return "meta";
    } else {
      return "unknown";
    }
  }

  /**
   * Merges midi events and sorts them by when they occur.
   *
   * If two midi events occur at the same time,
   * - If they are the same note, note off takes priority (to start a new note)
   * - If they are not the same note, note on takes priority (to create a slide)
   */
  function getSortedMidiEvents(midi) {
    const allMidiEvents = [];
    for (const track of midi.track) {
      let currTime = 0;

      for (const event of track.event) {
        currTime += event.deltaTime;
        allMidiEvents.push({ ...event, time: currTime });
      }
    }

    // Sorts in place
    allMidiEvents.sort(function (a, b) {
      const deltaTime = a.time - b.time;
      if (deltaTime) return deltaTime;

      // Same time
      let aPriority = 0;
      let bPriority = 0;
      const aType = getEventType(a);
      const bType = getEventType(b);
      if (
        (aType === "noteOn" || aType === "noteOff") &&
        (bType === "noteOn" || bType === "noteOff")
      ) {
        if (a.data[0] === b.data[0]) {
          // If same pitch, note off event has priority.
          // This is so when a note ends and immediately restarts,
          // we can merge them into one note
          aPriority = getEventType(a) === "noteOff" ? 1 : 0;
          bPriority = getEventType(b) === "noteOff" ? 1 : 0;
        } else {
          // If different pitch, note on event has priority.
          // This is so when a note ends and another starts at the
          // same time, we slide from the old to the new
          aPriority = getEventType(a) === "noteOn" ? 1 : 0;
          bPriority = getEventType(b) === "noteOn" ? 1 : 0;
        }
      }
      return bPriority - aPriority;
    });

    return allMidiEvents;
  }

  function generateNotesMidi2Tc(sortedMidiEvents, timeDivision) {
    /** Note that we're currently creating */
    let currentNote;

    for (const event of sortedMidiEvents) {
      if (getEventType(event) === "noteOff") {
        const pitch = event.data[0];

        // We ignore note-off events for pitches other than the current one
        // which prevents slide-start noteOffs from ending slides
        if (currentNote && pitch === currentNote.startPitch) {
          const { startTime, startPitch, startPitchBend } = currentNote;
          const length = event.time - startTime;
          const tcStartPitch = 
            convertPitch(startPitch, startPitchBend, event.time, timeDivision);

          MidiToNotes.notes.push([
            startTime / timeDivision,
            length > 0 ? length / timeDivision : defaultNoteLength,
            tcStartPitch,
            0,
            tcStartPitch,
          ]);

          currentNote = undefined;
        }
      } else if (getEventType(event) === "noteOn") {
        const pitch = event.data[0];
        const pitchBend = getPitchBendAdjustmentAtTime(event.time);

        if (currentNote) {
          const { startTime, startPitch, startPitchBend } = currentNote;
          const length = event.time - startTime;
          const tcStartPitch = 
            convertPitch(startPitch, startPitchBend, event.time, timeDivision);
          const tcEndPitch = 
            convertPitch(pitch, pitchBend, event.time, timeDivision);
          const tcPitchDelta = tcEndPitch - tcStartPitch;

          MidiToNotes.notes.push([
            startTime / timeDivision,
            length > 0 ? length / timeDivision : defaultNoteLength,
            tcStartPitch,
            tcPitchDelta,
            tcEndPitch,
          ]);
        }

        currentNote = {
          startTime: event.time,
          startPitch: pitch,
          startPitchBend: pitchBend,
        };
      }
    }
  }

  function generateNotesTccc(sortedMidiEvents, timeDivision) {
    /** Note that we're currently creating */
    let currentNote;

    for (const event of sortedMidiEvents) {
      if (getEventType(event) === "noteOff") {
        const pitch = event.data[0];

        // We ignore note-off events for pitches other than the current one
        // which prevents slide-start noteOffs from ending slides
        if (currentNote && pitch === currentNote.endPitch) {
          const { startTime, startPitch, endPitch, startPitchBend, endPitchBend } = currentNote;
          const length = event.time - startTime;
          const tcStartPitch = 
            convertPitch(startPitch, startPitchBend, event.time, timeDivision);
          const tcEndPitch = 
            convertPitch(endPitch, endPitchBend, event.time, timeDivision);
          const tcPitchDelta = tcEndPitch - tcStartPitch;

          MidiToNotes.notes.push([
            startTime / timeDivision,
            length > 0 ? length / timeDivision : defaultNoteLength,
            tcStartPitch,
            tcPitchDelta,
            tcEndPitch,
          ]);

          currentNote = undefined;
        }
      } else if (getEventType(event) === "noteOn") {
        const pitch = event.data[0];
        const pitchBend = getPitchBendAdjustmentAtTime(event.time);

        if (currentNote) {
          currentNote.endPitch = pitch;
          currentNote.endPitchBend = pitchBend;
        } else {
          currentNote = {
            startTime: event.time,
            startPitch: pitch,
            endPitch: pitch,
            startPitchBend: pitchBend,
            endPitchBend: pitchBend
          };
        }
      }
    }
  }

  /**
   * Collects all pitch bend events in the MIDI and converts the 
   * pitch bend value into semitones.
   */
  function collectPitchBendEvents(sortedMidiEvents) {
    MidiToNotes.pitchBendEvents = [];

    for (const event of sortedMidiEvents) {
      if (getEventType(event) === "pitchBend") {
        //A MIDI pitch bend event consists of two bytes 0aaaaaaa and 0bbbbbbb,
        //These are combined (bbbbbbbaaaaaaa) to form a value of 0-16383,
        //with the median (8192) being no bend. This is converted to semitones
        //according to the range specified in the settings.
        const midiPitchBend = ((event.data[1] << 7 | event.data[0]) - 8192) / 8192;
        const pitchEvent = {
          time: event.time,
          value: midiPitchBend * Settings.getSetting("pitchbendrange")
        };

        MidiToNotes.pitchBendEvents.push(pitchEvent)
      }
    }
  }

  /**
   * Finds the pitch adjust amount at a given time in the MIDI. If the MIDI time
   * is between two pitch bend events then the amount is found by a linear 
   * interpolation between the previous and next events. E.g. a time halfway between 
   * events of +0.5 and +1.0 semitones will have an adjust amount of +0.75.
   */
  function getPitchBendAdjustmentAtTime(midiTime) {
    const eventIndex = MidiToNotes.pitchBendEvents.findLastIndex((event) => event.time <= midiTime);
    if (eventIndex === -1) return 0;
    const pitchEvent = MidiToNotes.pitchBendEvents[eventIndex];

    if (eventIndex === MidiToNotes.pitchBendEvents.length - 1) return pitchEvent.value;
    const nextPitchEvent = MidiToNotes.pitchBendEvents[eventIndex + 1];

    const timeDelta = nextPitchEvent.time - pitchEvent.time;
    const pitchDelta = nextPitchEvent.value - pitchEvent.value;

    return pitchEvent.value + (midiTime - pitchEvent.time) / timeDelta * pitchDelta;
  }

  /**
   * Converts a given MIDI note pitch to TC pitch, and applies pitch bend.
   * The note is clamped (and a warning shown) if it goes out of range.
   */
  function convertPitch(midiPitch, midiPitchBend, midiTime, timeDivision) {
    const minTcPitch = -178.75;
    const maxTcPitch = 178.75;
    let tcPitch = (midiPitch - 60) * 13.75;
    let tcPitchBend = midiPitchBend * 13.75;
    let adjustedPitch = tcPitch + tcPitchBend;

    if (adjustedPitch < minTcPitch || adjustedPitch > maxTcPitch) {
      midiWarnings.add("Pitch bend adjustment clamped (out of range)", {
            adjustedPitch, beat: midiTime / timeDivision
      });

      adjustedPitch = Math.min(Math.max(adjustedPitch, minTcPitch), maxTcPitch);
    }

    return adjustedPitch;
  }

  function generateLyrics(sortedMidiEvents, timeDivision) {
    MidiToNotes.lyrics = [];

    for (const event of sortedMidiEvents) {
      const eventType = getEventType(event);
      if (
        eventType === "meta" &&
        (event.metaType === 0 || event.metaType === 5)
      ) {
        MidiToNotes.lyrics.push({
          bar: event.time / timeDivision,
          text: event.data.trim(),
        });
      }
    }
  }

  function generateWarnings(sortedMidiEvents, timeDivision) {
    const clampPitch = Settings.getSetting("clamppitch");
    const snaps = [Settings.getSetting("snap"), 12];

    for (const event of sortedMidiEvents) {
      const eventType = getEventType(event);
      if (eventType === "noteOn" || eventType === "noteOff") {
        warnIfUnsnapped(event.time, timeDivision, snaps);

        let pitch = event.data[0];
        if (pitch < 47 || pitch > 73) {
          midiWarnings.add(
            clampPitch ? "Pitch clamped" : "Pitch out of range",
            { pitch, beat: Math.floor(event.time / timeDivision) }
          );
          if (clampPitch) pitch = Math.min(Math.max(pitch, 47), 73);
        }
      } else if (eventType === "meta") {
        if (event.metaType === 81 && event.time !== 0) {
          // tempo change
          midiWarnings.add("Tempo change (unsupported)", {
            beat: Math.floor(event.time / timeDivision),
          });
        }
      }
    }
  }

  /** Returns whether a note is snapped (quantized) */
  function warnIfUnsnapped(eventTime, timeDivision, snaps) {
    for (const snap of snaps) {
      if ((eventTime * snap) % timeDivision === 0) return;
    }

    midiWarnings.add("Unsnapped note", {
      beat: Math.floor(eventTime / timeDivision),
      eventTime,
    });
  }

  return { calculatedEndpoint: 1, generateNotes, lyrics: [], notes: [] };
})();
