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
        @map-click="mapClick"
      ></Mapbox>
    </Panel>
  </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader } from '@denull/vkui/src/components'
let MapboxLanguage = require('@mapbox/mapbox-gl-language');
import Mapbox from 'mapbox-gl-vue'
import { MAPBOX_TOKEN } from '../tokens.js'
import EventBus from '../EventBus'

export default {
  name: 'MapView',
  props: {

  },
  data() {
    return {
      map: null,
      token: MAPBOX_TOKEN,
      center: [30.315, 59.939],
      zoom: 12,
      mapHeight: "",
      markers: [],
      mapInitialized: false
    }
  },
  computed: {
    features() {
      let _features = []

      this.markers.map((m) => {
        _features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              m.coordinates.x,
              m.coordinates.y
            ]
          },
          properties: m.data
        })
      });

      return {
        'type': 'FeatureCollection',
        'features': _features
      };
    }
  },
  mounted() {
    let vue_header = document.getElementsByClassName('View__header')[0].offsetHeight;
    let tabbar = document.getElementsByClassName('Tabbar')[0].offsetHeight;
    let height = vue_header - (-tabbar);
    this.mapHeight = 'height: calc(100vh - ' + height + 'px);';

    let self = this;
    EventBus.$on('map-mapInitialized', () => {
      self.mapInitialized = true;
    });
  },
  methods: {
    init(map) {
      this.map = map;
      map.addControl(new MapboxLanguage({
        defaultLanguage: 'ru'
      }));
    },

    loaded(map) {
      map.addSource(
        'blood_banks',
        {
          'type': 'geojson',
          'data': this.features
        }
      );
      map.addLayer({
        'id': 'blood_banks',
        'type': 'symbol',
        'source': 'blood_banks',
        'layout': {
          'icon-image': '{icon}-15',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });

      map.on('mouseenter', 'blood_banks', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'blood_banks', function () {
        map.getCanvas().style.cursor = '';
      });

      var mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
      var wasSizes = mapCanvas.style.width + '; ' + mapCanvas.style.height;
      this.mapResize(map, wasSizes);
    },

    updateFeatures() {
      this.map.getSource('blood_banks').setData(this.features);
    },

    mapClick(map, e) {
      const clickedFeatures = map.queryRenderedFeatures(e.point, {
        layers: ['blood_banks']
      });
      if (!clickedFeatures.length) {
        return;
      }

      const feature = clickedFeatures[0];
      console && console.log(feature.properties);
      //this.$emit('itemSelected', feature.properties);
    }
  },
  watch: {
    features: {
      handler() {
        this.updateFeatures();
      },
      deep: true
    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader,
    Mapbox
  }
}

</script>

<style>

#map-container {
	width: 100%;
	height: 100vh;
}


</style>
