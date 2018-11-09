<template>
    <div id="app">
        <button @click="test">Test</button>
        <button @click="testVK">testVK</button>

        <Root :activeView="activeView">
            <UserProfile id="feed" key="feed" title="Feed"></UserProfile>
            <UserProfile id="profile" key="profile" title="Profile"></UserProfile>
        </Root>
    </div>
</template>

<script>

import { Root, Epic, VKView, Panel, PanelHeader } from '@denull/vkui/src/components'
import UserProfile from './components/UserProfile.vue'

import dsApi from './DSApi'
import VKC from './VK/VKC'
import { VK_ACCESS_TOKEN } from './tokens.js'

export default {
    name: 'app',
    components: {
        Root, Epic, VKView, Panel, PanelHeader,
        UserProfile
    },
    mounted() {
      VKC.init(VK_ACCESS_TOKEN + "123", (e) => {});
    },
    data() {
        return {
            activeView: 'profile'
        }
    },
    methods: {
        test() {
            dsApi.send('', {

            }, (data) => {
                console && console.log(data)
            }, 'GET');
        },
        testVK() {
          VKC.quickApi('users.get', {
            fields: 'photo_100, sex, city, country'
          }, (data) => {
            console && console.log(data);
          });
        }
    }
}

</script>

<style>

#app {
}

</style>
