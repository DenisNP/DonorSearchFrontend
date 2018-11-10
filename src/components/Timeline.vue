<template>
  <VKView activePanel="defTimeline" v-bind="$attrs">
    <Panel id="defTimeline">
      <PanelHeader>Мои события</PanelHeader>
      <div class="timeline">
        <div class="left-column"></div>
        <div class="right-column">
          <!-- First subscribtion -->
          <div class="balloon">
            <div class="timeline-date">
              01.01.2018
            </div>
            <div class="balloon-content">
              <Cell>
                <Avatar :size="28" slot="before">
                  <vkui-icon name="document" :size="24" :style="{color: '#27ae60'}"/>
                </Avatar>
                Запись куда-то
              </Cell>
            </div>
          </div>
          <!-- Recommendation -->
          <div class="balloon">
            <div class="timeline-date">
              01.01.2018
            </div>
            <div class="balloon-content">
              <Cell>
                <Avatar :size="28" slot="before">
                  <vkui-icon name="document" :size="24" :style="{color: '#27ae60'}"/>
                </Avatar>
                Запись куда-то
              </Cell>
            </div>
          </div>
          <!-- Donation -->
          <div class="balloon">
            <div class="timeline-date">
              01.01.2018
            </div>
            <div class="balloon-content">
              <Cell>
                <Avatar :size="28" slot="before">
                  <vkui-icon name="document" :size="24" :style="{color: '#27ae60'}"/>
                </Avatar>
                Запись куда-то
              </Cell>
            </div>
          </div>
          <!-- Confirm visit -->
          <div class="balloon">
            <div class="timeline-date">
              01.01.2018
            </div>
            <div class="balloon-content">
              <Cell>
                <Avatar :size="28" slot="before">
                  <vkui-icon name="document" :size="24" :style="{color: '#27ae60'}"/>
                </Avatar>
                Запись куда-то
              </Cell>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader, Cell, Avatar } from '@denull/vkui/src/components'
import DSProfile from '../DSProfile'

export default {
  name: 'Timeline',
  props: {

  },
  data() {
    return {
      timeline: DSProfile.timeline
    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader,
    Cell,
    Avatar
  }
}

</script>

<style>

.timeline {
  display: flex;
}

.left-column {
  width: calc(30% - 1px);
  border-right: solid 1px #d7d8d9;
}

.right-column {
  width: 70%;
  background: rgba(255,255,255,0.5);
  min-height: 100vh;
}

.balloon {
  display: flex;
}

.balloon-content {
  background: white;
  padding: 10px;
  margin: 6px;
  border-radius: 8px;
  border: solid 1px #d7d8d999;
}

.timeline-date {
  margin-left: -28%;
  margin-right: 20px;
  margin-top: 10px;
  color: var(--text_secondary);
  font-size: 14px;
}

</style>
