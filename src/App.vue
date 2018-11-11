<template>
  <div id="app" :class="clientType">
    <Epic :activeStory="activeStory">
      <Tabbar slot="tabbar">
        <TabbarItem :selected='activeStory == "profile"' @click='setActiveStory("profile")'>
          <vkui-icon name="user" size="28" />
        </TabbarItem>
        <TabbarItem :selected='activeStory == "map"' @click='setActiveStory("map")'>
          <vkui-icon name="place" size="28" />
        </TabbarItem>
        <TabbarItem :selected='activeStory == "timeline"' @click='setActiveStory("timeline")'>
          <vkui-icon name="recent_outline" size="28" />
        </TabbarItem>
      </Tabbar>
      <UserProfile id="profile" key="profile" v-show="activeStory == 'profile'"/>
      <MapView id="map" key="map" v-show="activeStory == 'map'" :mapInitialized="mapInitialized"/>
      <Timeline id="timeline" key="timeline" v-show="activeStory == 'timeline'"/>
    </Epic>
  </div>
</template>

<script>

import { Epic, Tabbar, TabbarItem } from '@denull/vkui/src/components'
import DSProfile from './DSProfile'
import UserProfile from './components/UserProfile'
import MapView from './components/MapView'
import Timeline from './components/Timeline'

import DSApi from './DSApi'
import VKC from './VK/VKC'
import EventBus from './EventBus'
import { VK_ACCESS_TOKEN } from './tokens.js'

export default {
    name: 'app',
    components: {
        Epic, Tabbar, TabbarItem,
        UserProfile,
        MapView,
        Timeline
    },
    mounted() {
      VKC.init(VK_ACCESS_TOKEN, () => {
        VKC.subscribe((e) => {
          EventBus.$emit(e.type, e.data);
        });

        EventBus.$emit('VKCInit');
        this.clientType = "client--" + VKC.getClientType().toLowerCase();
      });
    },
    watch: {
      activeStory(val) {
        if(val == "map") {
          //open map
          if(!this.mapInitialized){
            this.mapInitialized = true;
          }
          EventBus.$emit('map-opened');
        }
      },
      '@route' (to, from) {
        Debug.log({router: [from, to]});
      }
    },
    data() {
        return {
            activeStory: 'profile',
            mapInitialized: false,
            clientType: "client--not-initialized",
            globalProfile: DSProfile.data
        }
    },
    methods: {
      setActiveStory(as) {
        if(as == this.activeStory) return;

        if(this.globalProfile.city_id) {
          this.activeStory = as;
        } else {
          EventBus.$emit('show-alert');
        }
      }
    }
}

</script>

<style>

body, html: {
  margin: 0;
  padding: 0;
}

.client--vkiframe .View .Panel__in {
    min-height: 100vh;
    max-height: 100vh;
    overflow-y: scroll;
}
.client--vkiframe ::-webkit-scrollbar {
    width: 10px;
}
.client--vkiframe ::-webkit-scrollbar-track {
    background: var(--background_page);
}
.client--vkiframe ::-webkit-scrollbar-thumb {
    background: var(--accent);
    border: 3px solid var(--background_page);
    border-radius: 5px;
}
.client--vkiframe ::-webkit-scrollbar-thumb:hover {
    background: #555;
}

</style>
