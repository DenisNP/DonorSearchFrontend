// Mapbox
    window.mapboxgl = require('mapbox-gl')

// Vue
    import Vue from 'vue'

// Application main component
    import App from './App.vue'

// Vue router
    import VueRouter from 'vue-router'
    Vue.use(VueRouter)

    const router = new VueRouter({
        mode: 'history',
        routes: []
    })

// VKUI Stylesheets
    import '@denull/vkui/src/styles/generated/palette.css';
    // import './client_red.css';

// VKUI Layout & VueRouter connection
    import { Epic, Root, VKView } from '@denull/vkui/src/components'
    import VKUIRouter from './plugins/vkui-vue-router'

    Epic.mixins = [VKUIRouter.RootMixin]
    Root.mixins = [VKUIRouter.RootMixin]
    VKView.mixins = [VKUIRouter.VKViewMixin]

// Hammer component for pulling panels
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

//
    Vue.config.productionTip = false

// Render Application in #app container
    new Vue({
      render: h => h(App),
      router
    }).$mount('#app')
