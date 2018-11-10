<template>
  <VKView activePanel="defTimeline" v-bind="$attrs">
    <Panel id="defTimeline" theme="white">
      <PanelHeader>Моя события</PanelHeader>

    </Panel>
  </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader } from '@denull/vkui/src/components'

export default {
  name: 'Timeline',
  props: {

  },
  data() {
    return {

    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader
  }
}

</script>

<style>



</style>
