window.mapboxgl = require('mapbox-gl')

import Vue from 'vue'

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import App from './App.vue'

import '@denull/vkui/src/styles/generated/palette.css';
import '@denull/vkui/src/styles/generated/client_light.css';

const Hammer = require('hammerjs');

Vue.directive("pan", {
  bind: function(el, binding) {
    if (typeof binding.value === "function") {
      const mc = new Hammer(el);
      mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
      mc.on("pan", binding.value);
    }
  }
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
