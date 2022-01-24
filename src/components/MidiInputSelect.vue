<template>
  <div>
    <v-select :items="midiInputs" label="Outlined style" outlined></v-select>
  </div>
</template>


<script>
import Midi from "@tonaljs/midi";

const CMD_NOTE_OFF = 8;
const CMD_NOTE_ON = 9;
const CMD_AFTERTOUCH = 10;
const CMD_CC = 11;
const CMD_PITCHBEND = 14;
// const NOTE_CC_MODWHEEL = 1;

export default {
  name: "MidiInputSelect",
  data: () => ({
    midiInputs: [],
  }),
  computed: {
    inputs: {
      get() {
        return this.midiInputs;
      },
      set(inputs) {
        console.log("set");
        this.midiInputs = inputs;
      },
    },
  },
  mounted() {
    const onMidiStarted = (midi) => {
      console.log("midi", midi);

      listInputsAndOutputs(midi);
      startLoggingMIDIInput(midi, 0);

      midi.onstatechange = (e) => {
        console.log(e);
      };
    };

    const listInputsAndOutputs = (midiAccess) => {
      const inputNames = [];

      for (var entry of midiAccess.inputs) {
        var input = entry[1];
        inputNames.push(input.name);
        console.log(
          "Input port [type:'" +
            input.type +
            "'] id:'" +
            input.id +
            "' manufacturer:'" +
            input.manufacturer +
            "' name:'" +
            input.name +
            "' version:'" +
            input.version +
            "'"
        );
      }
      this.inputs = inputNames;
    };

    const midiMessageReceived = (ev) => {
      let cmd = ev.data[0] >> 4;
      let channel = ev.data[0] & 0xf;
      let noteNumber = ev.data[1];
      let velocity = ev.data[2];

      if (channel === 9) return;
      if (cmd === CMD_NOTE_OFF || (cmd === CMD_NOTE_ON && velocity === 0)) {
        // with MIDI, note on with velocity zero is the same as note off
        // note off
        console.log("note off", noteNumber);
        this.$store.commit("removeNote", Midi.midiToNoteName(noteNumber));
      } else if (cmd === CMD_NOTE_ON) {
        // note on
        console.log("note on", noteNumber);
        this.$store.commit("addNote", Midi.midiToNoteName(noteNumber));
        // noteOn(noteNumber, velocity / 127.0);
      } else if (cmd === CMD_CC) {
        /*
        if (noteNumber === NOTE_CC_MODWHEEL) {
          modWheel(velocity / 127.0);
        } else {
          controller(noteNumber, velocity / 127.0);
        }
        */
      } else if (cmd === CMD_PITCHBEND) {
        // pitch wheel
        // pitchWheel((velocity * 128.0 + noteNumber - 8192) / 8192.0);
      } else if (cmd === CMD_AFTERTOUCH) {
        // poly aftertouch
        // polyPressure(noteNumber, velocity / 127);
      } else console.log("" + ev.data[0] + " " + ev.data[1] + " " + ev.data[2]);
    };

    const startLoggingMIDIInput = (midiAccess /*, indexOfPort*/) => {
      midiAccess.inputs.forEach(function (entry) {
        entry.onmidimessage = midiMessageReceived;
      });
    };

    const onMIDISystemError = (error) => {
      console.log("error", error);
    };

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMidiStarted, onMIDISystemError);
    } else {
      console.log("no midi");
    }
  },
};
</script>