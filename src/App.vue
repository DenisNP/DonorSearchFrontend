<template>
  <div id="app">
    <Epic :activeStory="activeStory">
      <Tabbar slot="tabbar">
        <TabbarItem :selected='activeStory == "profile"' @click='activeStory="profile"'>
          <vkui-icon name="user" size="28" />
        </TabbarItem>
        <TabbarItem :selected='activeStory == "map"' @click='activeStory="map"'>
          <vkui-icon name="place" size="28" />
        </TabbarItem>
        <TabbarItem :selected='activeStory == "timeline"' @click='activeStory="timeline"'>
          <vkui-icon name="recent_outline" size="28" />
        </TabbarItem>
      </Tabbar>
      <UserProfile id="profile" key="profile"/>
      <MapView id="map" key="map"/>
      <Timeline id="timeline" key="timeline"/>
    </Epic>
  </div>
</template>

<script>

import { Epic, Tabbar, TabbarItem } from '@denull/vkui/src/components'
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
      });
    },
    data() {
        return {
            activeStory: 'profile'
        }
    },
    methods: {

    }
}

</script>

<style>


</style>
