window.mapboxgl = require('mapbox-gl')

import Vue from 'vue'
import App from './App.vue'

import '@denull/vkui/src/styles/generated/palette.css';
import '@denull/vkui/src/styles/generated/client_light.css';

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
