<template>
  <v-container> </v-container>
</template>

<script>
const noteMap = {
  a: "C3",
  w: "C#3",
  s: "D3",
  e: "D#3",
  d: "E3",
  f: "F3",
  t: "F#3",
  g: "G3",
  z: "G#3",
  h: "A3",
  u: "A#3",
  j: "B3",
};

const keys = Object.keys(noteMap);

export default {
  name: "HelloWorld",

  data: () => ({}),
  mounted() {
    keys.forEach((key) => this.$mousetrap.bind(key, this.logItDown, "keydown"));
    keys.forEach((key) => this.$mousetrap.bind(key, this.logItUp, "keyup"));

  },
  methods: {
    logItDown(e) {
      if (e.repeat) {
        return false;
      }

      if (keys.indexOf(e.key) === -1) {
        return false;
      }

      this.$store.commit("addNote", noteMap[e.key]);
      return false;
    },

    logItUp(e) {
      if (e.repeat) {
        return false;
      }

      if (keys.indexOf(e.key) === -1) {
        return false;
      }

      this.$store.commit("removeNote", noteMap[e.key]);
      return false;
    },
  },
};
</script>
