<template>
  <VKView activePanel="defMap" v-bind="$attrs" key="mapController">
    <ScreenSpinner slot="popout" v-if="loader"/>
    <Panel id="defMap" theme="white" key="mapPanel">
      <PanelHeader id="mapHeader">Станции приёма
        <HeaderButton slot="left" @click="setCenter" v-show="userLocation.lat">
          <vkui-icon name="place" size="28" />
        </HeaderButton>
      </PanelHeader>
      <!-- <Mapbox v-if="mapInitialized"
        :style="mapHeight"
        :access-token=token
        :map-options="mapOptions"

        @map-init="init"
        @map-load="loaded"
      ></Mapbox> -->
      <div id="mapContainer" ref="mapCont" :style="mapHeight" v-show="true" key="mapDiv">

      </div>
      <BottomPopup :opened="station != null" @close="station = null" :openedHeight="assumeHeight">
        <Header level="2">
            {{ station && station.title }}
        </Header>
        <Div class="shrinkedDiv Avatar-transparent" v-show="station && station.requrement_of_user_blood != 0">
          <Cell>
            <Avatar :size="28" slot="before" :src="(station && station.requrement_of_user_blood == -2) ? activeIcon : normalIcon" />
            {{ bloodRequirement() }}
            <Button slot="asideContent" level="primary" v-show="userCanStartTimeline" @click="sendSubscribe">Записаться</Button>
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
        <Div class="Avatar-transparent">
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

import { MAPBOX_TOKEN } from '../tokens'

import VKC from '../VK/VKC'
import DSApi from '../DSApi'
import { VKView, Panel, PanelHeader, HeaderButton, Header, Button, InfoRow, Cell, Div, ScreenSpinner } from '@denull/vkui/src/components'
let MapboxLanguage = require('@mapbox/mapbox-gl-language');
import Mapbox from 'mapbox-gl-vue'
import BottomPopup from './BottomPopup'
import EventBus from '../EventBus'
import DSProfile from '../DSProfile'

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
      center: [30.315, 59.939],
      zoom: 12,
      mapHeight: "",
      loader: false,
      markers: [

      ],
      mapLoaded: false,
      accessToken: MAPBOX_TOKEN,
      mapMarkers: [],
      mapOptions: {
        style: 'mapbox://styles/mapbox/light-v9',
        center: [30.315, 59.939],
        zoom: 12,
        container: 'mapContainer'
      },
      mapVisible: false,
      userLocation: {
        lng: "",
        lat: ""
      },
      station: null,
      lastStationsGot: 0,
      activeIcon: "https://developer.donorsearch.org/dropplet.svg",
      normalIcon: "https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg",
      timeline: DSProfile.timeline
    }
  },
  mounted() {
    let vue_header = document.getElementsByClassName('View__header')[0].offsetHeight;
    let tabbar = document.getElementsByClassName('Tabbar')[0].offsetHeight;
    let height = vue_header - (-tabbar);
    this.mapHeight = 'height: ' + (screen.height - height) + 'px; width: ' + screen.width + 'px;';

    let self = this;
    EventBus.$on('map-opened', function() {
      if(!self.mapMarkers || !self.mapMarkers.length)
        self.loadStations(true);

      self.$nextTick(() => {
        var mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
        mapCanvas.style.width = '100%';
        mapCanvas.style.height = '800px';
        self.map.resize();
      });

      self.updateMarkers(self.markers);
    });

    console && console.log('MAP LOADING', this.mapOptions, this.mapHeight);
    window.mapboxgl.accessToken = this.accessToken;
    this.map = new window.mapboxgl.Map(this.mapOptions);
    this.map.addControl(new MapboxLanguage({
      defaultLanguage: 'ru'
    }));

    this.map.on('load',() => {

      self.mapVisible = true;

      self.$nextTick(() => {
        var mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
        mapCanvas.style.width = '100%';
        mapCanvas.style.height = '800px';
        self.map.resize();
        self.mapLoaded = true;

        self.updateMarkers(self.markers);
      });
    });


    //this.mapHeight = 'height: calc(100vh - ' + height + 'px); width: 100vw;';
  },
  methods: {
    updateMarkers(_markers) {
      let self = this;
      if(!this.map || !this.mapLoaded) return;
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
          .addTo(self.map);

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
      if((force || this.lastStationsGot > 0) && DSProfile.data.vk_id) {
        let self = this;
        let diff = Date.now() - this.lastStationsGot;

          this.lastStationsGot = Date.now();
          self.loader = true;
          DSApi.send('Stations/' + DSProfile.data.vk_id, {}, (data) => {
            self.markers = [];

            if(!data.error) {
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
                  phones: s.phones || '',
                  requrement_of_user_blood: s.requrement_of_user_blood
                };

                self.markers.push(sData);
              });

              self.loader = false;
              self.updateMarkers(self.markers);
            }
          },(err) => {
            self.loader = false;
          });
        }
      },
      sendSubscribe() {
        EventBus.$emit('subscribe-station', this.station);
      },

      bloodRequirement() {
        if(!this.station || this.station.requrement_of_user_blood == 0) return "";
        let bType = DSProfile.data.blood_type || "";
        if(bType) {
          return this.station.requrement_of_user_blood == -2 ? "Дефицит " + bType : "Потребность в " + bType;
        } else {
          return this.station.requrement_of_user_blood == -2 ? "Дефицит" : "Есть потребность";
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
    },

    userCanStartTimeline() {
      if(this.timeline.donation_date
        || !this.timeline.appointment_date_from
        || !this.timeline.appointment_date_to)
       return false;

      let dFrom = new Date(this.timeline.appointment_date_from);
      let dTo = new Date(this.timeline.appointment_date_to);
      let dn = Date.now();
      let diff = dFrom - dn;
      return /*dTo >= dn &&*/ diff <= 3600000*24*7;
    }
  },
  watch: {
    // markers: {
    //   handler(val) {
    //     this.updateMarkers(val);
    //   },
    //   deep: true
    // },
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
      if(this.map)
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
    Div,
    ScreenSpinner
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
  z-index: 2;

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

.Div.shrinkedDiv {
  padding-top: 0!important;
  padding-bottom: 0!important;
  margin-top: -3px!important;
}

#mapCointainer {
	text-align: center;
}

</style>

<style scoped>

.Div.myDiv {
  padding-top: 6px!important;
  padding-bottom: 6px!important;
}

</style>
