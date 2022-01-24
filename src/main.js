import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex';
import VueMousetrapPlugin from 'vue-mousetrap/vue2'
import { Note } from '@tonaljs/tonal';
import vuetify from './plugins/vuetify'

Vue.use(Vuex);
Vue.use(VueMousetrapPlugin);

Vue.config.productionTip = false;

const store = new Vuex.Store({
  state: {
    notes: []
  },
  mutations: {
    addNote(state, note) {
      state.notes.push(note);
      Vue.set(state, 'notes', Note.sortedNames(state.notes));
    },
    removeNote(state, note) {
      const arr = state.notes.filter(item => item !== note);
      Vue.set(state, 'notes', Note.sortedNames(arr));
    }
  }
});

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
