<template>
    <div id="app">
        <button @click="test">Test</button>
    </div>
</template>

<script>

import HelloWorld from './components/HelloWorld.vue'
<<<<<<< Updated upstream
import dsApi from './DSApi'

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
        }
    }
=======
import VKC from './VK/VKC'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  mounted() {

  }
>>>>>>> Stashed changes
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
