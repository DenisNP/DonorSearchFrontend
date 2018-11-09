<template>
  <VKView activePanel="defMap" v-bind="$attrs">
    <Panel id="defMap" theme="white">
      <PanelHeader>Карта</PanelHeader>

    </Panel>
  </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader } from '@denull/vkui/src/components'

export default {
  name: 'MapView',
  props: {

  },
  data() {
    return {}
  },
  components: {
    VKView,
    Panel,
    PanelHeader
  }
}

</script>
