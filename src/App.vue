<template>
    <div id="app">
        <button @click="test">Test</button>
        <button @click="testVK">testVK</button>
    </div>
</template>

<script>

import dsApi from './DSApi'
import VKC from './VK/VKC'
import { VK_ACCESS_TOKEN } from './tokens.js'

export default {
    name: 'app',
    components: {

    },
    mounted() {
      VKC.init(VK_ACCESS_TOKEN + "123", (e) => {});
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
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

</style>
