<template>
  <div>
    <div>Notes: {{ notes }}</div>
    <div>
      <h2>{{ chord }}</h2>
    </div>
    <div class="keyboard-wrap">
      <Keyboard
        width="100%"
        :notes="chordToMidi"
        :key="chordToMidi.join(',')"
      />
    </div>
    <v-sheet :elevation="12" rounded class="mx-auto" height="300" width="500">
      <div id="notation"></div>
    </v-sheet>
  </div>
</template>


<script>
import Vex from "vexflow";
import ChordDetect from "@tonaljs/chord-detect";
import Midi from "@tonaljs/midi";

import Keyboard from "./Keyboard";

export default {
  name: "ChordNotation",

  data: () => ({}),

  components: {
    Keyboard,
  },

  computed: {
    notes() {
      return this.$store.state.notes;
    },
    chordToMidi: {
      get() {
        if (!this.$store.state.notes.length) {
          return [];
        }
        let notes = this.$store.state.notes.filter(
          (n) => typeof n === "string"
        );
        return notes.map((note) => Midi.toMidi(note));
      },
    },
    chord() {
      try {
        if (this.$store.state.notes.length <= 2) {
          return "Press at least 3 keys";
        }
        let notes = this.$store.state.notes.filter(
          (n) => typeof n === "string"
        );
        return ChordDetect.detect(notes).join(", ");
      } catch (error) {
        console.error(error);
        return "Error detecting chord";
      }
    },
  },

  mounted() {
    this.renderNotes();
  },

  beforeUpdate() {
    this.renderNotes();
  },

  methods: {
    renderNotes() {
      // TODO
      const myNode = document.getElementById("notation");
      myNode.innerHTML = "";

      const vf = new Vex.Flow.Factory({
        renderer: { elementId: "notation", width: 500, height: 500 },
      });

      const score = vf.EasyScore();
      const system = vf.System();

      let notes = this.$store.state.notes.filter((n) => typeof n === "string");

      if (notes.length === 0) {
        // TODO
        console.log("force D4", notes.length);
        notes = [];
      }

      const { bass, treble } = notes
        .map((note) => Midi.toMidi(note))
        .reduce(
          (acc, item) => {
            if (item < 60) {
              acc["bass"].push(Midi.midiToNoteName(item));
            } else {
              acc["treble"].push(Midi.midiToNoteName(item));
            }
            return acc;
          },
          { bass: [], treble: [] }
        );

      const renderStave = (chordNotes, clef) => {
        const voices = [];
        if (chordNotes.length === 0) {
          const ghost = new Vex.Flow.GhostNote({ duration: "w", clef });
          voices.push(score.voice([ghost]));
        } else {
          const chord = chordNotes.join(" ");
          const chordString =
            chordNotes.length > 1 ? `(${chord})/w` : `${chord}/w`;
          voices.push(score.voice(score.notes(chordString, { clef })));
        }

        system.addStave({ voices }).addClef(clef).addTimeSignature("4/4");
      };

      renderStave(treble, "treble");
      renderStave(bass, "bass");

      system.addConnector();

      vf.draw();
    },
  },
};
</script>


<style scoped>
.keyboard-wrap {
  position: fixed;
  text-align: center;
  height: 100px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
