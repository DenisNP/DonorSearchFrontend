<template>
    <div id="app">
        <button @click="test">Test</button>
        <button @click="testVK">testVK</button>
    </div>
</template>

<script>

import HelloWorld from './components/HelloWorld.vue'
import dsApi from './DSApi'
import VKC from './VKC'

export default {
    name: 'app',
    components: {
        HelloWorld
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
