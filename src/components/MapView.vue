<template>
  <VKView activePanel="defMap" v-bind="$attrs">
    <Panel id="defMap" theme="white">
      <PanelHeader id="mapHeader">Станции приёма
        <HeaderButton slot="left" @click="setCenter" v-show="userLocation.lat">
          <vkui-icon name="place" size="28" />
        </HeaderButton>
      </PanelHeader>
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
      <BottomPopup :opened="station != null" @close="station = null" :openedHeight="assumeHeight">
        <Header level="2">
            {{ station && station.title }}
        </Header>
        <Div class="shrinkedDiv" v-show="station && station.requrement_of_user_blood != 0">
          <Cell>
            <Avatar :size="28" slot="before" :src="station && station.requrement_of_user_blood == -2 ? activeIcon : normalIcon" />
            {{ station && station.requrement_of_user_blood == -2 ? "Высокая потребность" : "Средняя потребность" }}
            <Button slot="asideContent" level="primary">Записаться</Button>
          </Cell>
        </Div>
        <Div class="myDiv" v-show="station && station.address">
          <InfoRow>
            <span slot="title">Адрес</span>
            {{ station && station.address }}
          </InfoRow>
        </Div>
        <Div class="myDiv" v-show="station && station.phones">
          <InfoRow>
            <span slot="title">Телефон</span>
            {{ station && station.phones }}
          </InfoRow>
        </Div>
        <Div>
          <Cell v-show="station && station.accept_first_timers">
              <Avatar :size="28" slot="before" >
                <vkui-icon name="education" :size="24" :style="{color: '#27ae60'}"/>
              </Avatar>
              Можно первый раз
          </Cell>
          <Cell v-show="station && station.without_registration">
            <Avatar :size="28" slot="before" >
              <vkui-icon name="document" :size="24" :style="{color: '#27ae60'}"/>
            </Avatar>
              Можно без прописки
          </Cell>
        </Div>
      </BottomPopup>
    </Panel>
  </VKView>
</template>

<script>

import { MAPBOX_TOKEN } from '../tokens.js'

import VKC from '../VK/VKC'
import DSApi from '../DSApi'
import { VKView, Panel, PanelHeader, HeaderButton, Header, Button, InfoRow, Cell, Div } from '@denull/vkui/src/components'
let MapboxLanguage = require('@mapbox/mapbox-gl-language');
import Mapbox from 'mapbox-gl-vue'
import BottomPopup from './BottomPopup'
import EventBus from '../EventBus'

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
      markers: [

      ],
      mapMarkers: [],
      userLocation: {
        lng: "",
        lat: ""
      },
      lastStationsGot: 0,
      station: null,
      activeIcon: "https://developer.donorsearch.org/dropplet.svg",
      normalIcon: "https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg"
    }
  },
  mounted() {
    let vue_header = document.getElementsByClassName('View__header')[0].offsetHeight;
    let tabbar = document.getElementsByClassName('Tabbar')[0].offsetHeight;
    let height = vue_header - (-tabbar);
    this.mapHeight = 'height: calc(100vh - ' + height + 'px);';

    let self = this;
    EventBus.$on('map-opened', function() {
      self.loadStations();
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
      let self = this;

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

        el.onclick = function() {
          self.stationClicked(mData);
        };

        let m = new window.mapboxgl.Marker(el)
          .setLngLat(mData.coordinates)
          .addTo(this.map);

        this.mapMarkers.push(m);
      }
    },

    stationClicked(data) {
      this.station = data;
      this.center = [this.station.coordinates[0], this.station.coordinates[1] - 0.03 * (5000 / Math.pow(this.map.getZoom()*1.0, 4.0))];
    },

    setCenter() {
      this.center = [this.userLocation.lng, this.userLocation.lat];
    },

    loadStations(force) {
      if(force || this.lastStationsGot > 0) {
        let self = this;
        let diff = Date.now - this.lastStationsGot;
        if(diff > 3600000 || force) {
          this.lastStationsGot = Date.now;

          DSApi.send('Stations/' + '463377', {}, (data) => {
            self.markers = [];

            data.forEach((s) => {
              let sData = {
                coordinates: [s.lng, s.lat],
                classes: [
                  "marker",
                  s.requrement_of_user_blood == -2
                  ? 'station-active'
                  : (s.requrement_of_user_blood == -1
                    ? 'station-normal'
                    : 'station-disabled')
                  ],
                title: s.title || s.address,
                address: s.address || '',
                id: s.id,
                without_registration: s.without_registration,
                accept_first_timers: s.accept_first_timers,
                phones: s.phones || ''
              };

              self.markers.push(sData);
            });
          });
        }
      }
    }
  },
  computed: {

    assumeHeight() {
      let s = this.station;
      if(!s) return 200;
      let tHeight = s.title.length / (155.0/5.0) * 20.0 + 29.0;
      if(s.address)
        tHeight -= -68;
      if(s.phones)
        tHeight -= -50;
      if(s.without_registration)
        tHeight -= -50;
      if(s.accept_first_timers)
        tHeight -= -50;
      if(s.requrement_of_user_blood != 0)
        tHeight -= -50;

      return tHeight - (-50);
    }
  },
  watch: {
    markers: {
      handler(val) {
        this.updateMarkers(val);
      },
      deep: true
    },
    mapInitialized(val) {
      if(val) {
        let self = this;

        VKC.send('VKWebAppGetGeodata', {});
        EventBus.$on('VKWebAppGeodataResult', function(geo) {
          self.userLocation.lat = geo.lat;
          self.userLocation.lng = geo.long;

          self.center = [geo.long, geo.lat];
          self.loadStations(true);
        });
      }
    },
    center(val) {
      this.map.flyTo({center: val});
    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader,
    Mapbox,
    BottomPopup,
    HeaderButton,
    Header,
    Button,
    InfoRow,
    Cell,
    Div
  }
}

</script>

<style>

#map-container {
	width: 100%;
	height: 100vh;
}

.marker {
  width: 70px;
  height: 50px;
}

@keyframes station-active-pulse {
    0% {
      background-position: 0px 0;
    }
    33% {
      background-position: -70px 0;
    }
    67% {
      background-position: -140px 0;
    }
}

.station-active {
  background-image: url('../assets/full_blood_active.svg');
  background-repeat: no-repeat;
  background-size: 210px;
  background-position: 0 0;
  z-index: 10;

  animation: station-active-pulse 2s steps(1) infinite;
}

.station-normal {
  background-image: url('../assets/full_blood.svg');
  background-repeat: no-repeat;
  background-size: 70px;
  background-position: 0 0;
}

.station-disabled {
  background-image: url('../assets/full_blood_disabled.svg');
  background-repeat: no-repeat;
  background-size: 60px;
  background-position: 0 0;
  width: 60px!important;
}

</style>

<style scoped>

.Div.myDiv {
  padding-top: 6px!important;
  padding-bottom: 6px!important;
}

.Div.shrinkedDiv {
  padding-top: 0!important;
  padding-bottom: 0!important;
  margin-top: -3px!important;
}

</style>
