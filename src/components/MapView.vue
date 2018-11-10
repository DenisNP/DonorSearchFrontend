<template>
  <VKView activePanel="defMap" v-bind="$attrs">
    <Panel id="defMap" theme="white">
      <PanelHeader id="mapHeader">Карта</PanelHeader>
      <Mapbox v-if="mapInitialized"
        :style="mapHeight"
        :access-token=token
        :map-options="{
        style: 'mapbox://styles/mapbox/light-v9',
          center,
          zoom,
          container: 'map-container'
        }"

        @map-init="init"
        @map-load="loaded"
      ></Mapbox>
      <BottomPopup :opened="popup.opened" collapsible @close="popup.opened = false">
        Test test
      </BottomPopup>
    </Panel>
  </VKView>
</template>

<script>

import { MAPBOX_TOKEN } from '../tokens.js'

import { VKView, Panel, PanelHeader } from '@denull/vkui/src/components'
let MapboxLanguage = require('@mapbox/mapbox-gl-language');
import Mapbox from 'mapbox-gl-vue'
import BottomPopup from './BottomPopup'

export default {
  name: 'MapView',
  props: {
    mapInitialized: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: null,
      token: MAPBOX_TOKEN,
      center: [30.315, 59.939],
      zoom: 12,
      mapHeight: "",
      markers: [],
      mapMarkers: [],
      popup: {
        opened: false
      }
    }
  },
  computed: {

  },
  mounted() {
    let vue_header = document.getElementsByClassName('View__header')[0].offsetHeight;
    let tabbar = document.getElementsByClassName('Tabbar')[0].offsetHeight;
    let height = vue_header - (-tabbar);
    this.mapHeight = 'height: calc(100vh - ' + height + 'px);';
  },
  methods: {
    init(map) {
      this.map = map;
      map.addControl(new MapboxLanguage({
        defaultLanguage: 'ru'
      }));
    },

    loaded(map) {
      /*map.addSource(
        'blood_banks',
        {
          'type': 'geojson',
          'data': this.features
        }
      );*/
      /*map.addLayer({
        'id': 'blood_banks',
        'type': 'symbol',
        //'source': 'blood_banks',
        'layout': {
          'icon-image': '{icon}-15',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });*/

      /*map.on('mouseenter', 'blood_banks', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'blood_banks', function () {
        map.getCanvas().style.cursor = '';
      });*/
      this.updateMarkers(this.markers);
    },

    updateMarkers(_markers) {
      this.mapMarkers.forEach((mm) => {
          mm && mm.remove && mm.remove();
      });
      this.mapMarkers = [];

      for(let idx in _markers) {
        let mData = _markers[idx];
        let el = document.createElement('div');
        if(mData.classes) {
          el.className = mData.classes.join(" ");
        }
        let m = new window.mapboxgl.Marker(el)
          .setLngLat(mData.coordinates)
          .addTo(this.map);

        this.mapMarkers.push(m);
      }
    }
    /*updateFeatures() {
      this.map.getSource('blood_banks').setData(this.features);
    },*/

    /*mapClick(map, e) {

      this.popup.opened = true;

      const clickedFeatures = map.queryRenderedFeatures(e.point, {
        layers: ['blood_banks']
      });
      if (!clickedFeatures.length) {
        return;
      }

      const feature = clickedFeatures[0];
      console && console.log(feature.properties);
    }*/
  },
  watch: {
    markers: {
      handler(val) {
        this.updateMarkers(val);
      },
      deep: true
    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader,
    Mapbox,
    BottomPopup
  }
}

</script>

<style>

#map-container {
	width: 100%;
	height: 100vh;
}


</style>
