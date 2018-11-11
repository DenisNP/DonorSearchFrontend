<template>
  <VKView :activePanel="activePanel" v-bind="$attrs">
    <Panel id="defTimeline">
      <PanelHeader>Мои события</PanelHeader>
      <div class="timeline">
        <div class="left-column"></div>
        <div class="right-column Avatar-transparent">
          <!-- First subscribtion -->
          <div class="balloon" v-show="timeline.appointment_date_from && timeline.appointment_date_to">
            <div class="timeline-date">
              <span>{{ showDate(timeline.appointment_date_from) }}</span><span>{{ showDate(timeline.appointment_date_to) }}</span>
            </div>
            <vkui-icon name="recent_outline" :size="28" :style="{color: '#27ae60', 'margin-top': '6px'}"/>
            <div class="balloon-content">
              <Group title="Запись на сдачу крови">
                <Input class="MyInput" type="date" />
                <CellButton>Противопоказания</CellButton>
              </Group>
            </div>
          </div>
          <!-- Recommendation -->
          <div class="balloon" v-show="timeline.recomendation_timestamp">
            <div class="timeline-date">
              {{ showDate(timeline.recomendation_timestamp) }}
            </div>
            <vkui-icon name="info" class="MyIcon28" :size="24" :style="{color: '#5181b8', 'margin-top': '6px'}"/>
            <div class="balloon-content BallonClear">
              <Button size="xl" level="primary" @click="activePanel = 'warnings'">Памятка к сдаче</Button>
              <!-- <Div>
                <Button size="xl" level="secondary">Памятка</Button>
              </Div> -->
            </div>
          </div>
          <!-- Donation -->
          <div class="balloon" v-show="timeline.station_id">
            <div class="timeline-date">
              {{ showDate(timeline.donation_date) }}
            </div>
            <div class="MyIcon28"  :style="{'margin-top': '8px'}">
              <img src="https://developer.donorsearch.org/design_elements/dropplets/full_blood.svg" width="28" height="28"/>
            </div>
            <div class="balloon-content">
              <!-- <Group title="Следующая донация"> -->
                <Header level="2">
                    {{ timeline.station_title }}
                </Header>
                <Div class="myDiv" v-show="timeline.station_address">
                  <InfoRow>
                    <span slot="title">Адрес</span>
                    {{ timeline.station_address }}
                  </InfoRow>
                </Div>

                <Button v-show="datePassed(timeline.donation_date)">
                  <span slot="before">
                    <vkui-icon name="camera" :size="24"/>
                  </span>
                  Добавить донацию
                </Button>
                <input
              <!-- </Group> -->
            </div>
          </div>
          <!-- Confirm visit -->
          <div class="balloon" v-show="timeline.confirm_visit.date_from && timeline.confirm_visit.date_to">
            <div class="timeline-date">
              <span>{{ showDate(timeline.confirm_visit.date_from) }}</span><span>{{ showDate(timeline.confirm_visit.date_to) }}</span>
            </div>
            <vkui-icon name="user_add" :size="28" :style="{color: '#27ae60', 'margin-top': '6px'}"/>
            <div class="balloon-content">

            </div>
          </div>
        </div>
      </div>
    </Panel>
    <Panel id="warnings">
  		<PanelHeader>
  			<HeaderButton slot="left" @click="activePanel = 'defTimeline'">
                  <!-- <template v-if="osname === 'IOS'">
                      Отмена
                  </template> -->
                  <vkui-icon :size="24" name="cancel" />
              </HeaderButton>

  			Противопоказания
  		</PanelHeader>

  		<Group>
  			<List>
  				<Cell description="Никогда!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					Не есть!
  				</Cell>

  				<Cell description="Вообще!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					И не пить!
  				</Cell>
  			</List>
  		</Group>

  		<Group>
  			<List>
  				<Cell description="Для количества!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					Ну и не спать!
  				</Cell>
  			</List>
  		</Group>
  	</Panel>
    <Panel id="recommendations">
  		<PanelHeader>
  			<HeaderButton slot="left" @click="activePanel = 'defTimeline'">
                  <!-- <template v-if="osname === 'IOS'">
                      Отмена
                  </template> -->
                  <vkui-icon :size="24" name="cancel" />
              </HeaderButton>

  			Памятка к сдаче
  		</PanelHeader>

  		<Group>
  			<List>
  				<Cell description="Никогда!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					Не есть!
  				</Cell>

  				<Cell description="Вообще!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					И не пить!
  				</Cell>
  			</List>
  		</Group>

  		<Group>
  			<List>
  				<Cell description="Для количества!">
  					<vkui-icon :size="24" name="error" slot="before" />

  					Ну и не спать!
  				</Cell>
  			</List>
  		</Group>
  	</Panel>
  </VKView>
</template>

<script>

import { VKView, Panel, PanelHeader, Cell, Avatar, Button, CellButton, Group, Input, Div } from '@denull/vkui/src/components'
import DSProfile from '../DSProfile'

export default {
  name: 'Timeline',
  props: {

  },
  data() {
      return {
        timeline: DSProfile.timeline,
        activePanel: "defTimeline"
      }
  },
  computed: {

  },
  methods: {
    showDate(d) {
      if(!d) return "";
      let _d = new Date(d);
      return ("0"+_d.getDate()).substr(-2) + "." + ("0"+_d.getMonth()-(-1)).substr(-2) + "." + ("0"+_d.getFullYear()).substr(-2);
    },
    datePassed(d) {
      if(!d) return false;
      let _d = new Date(d);
      return _d.getTime() <= Date.now();
    }
  },
  components: {
    VKView,
    Panel,
    PanelHeader,
    Cell,
    Avatar,
    Button,
    CellButton,
    Group,
    Input,
    Div
  }
}

</script>

<style>

.timeline {
  display: flex;
}

.left-column {
  width: calc(25% - 1px);
  border-right: solid 1px #d7d8d9;
}

.right-column {
  width: 75%;
  background: rgba(255,255,255,0.5);
  min-height: 100vh;
  padding-top: 20px;
}

.balloon {
  display: flex;
}

.balloon-content {
  background: white;
  padding-left: 10px;
  padding-right: 10px;
  margin: 6px;
  border-radius: 8px;
  border: solid 1px #d7d8d999;
}

.timeline-date {
  margin-left: -80px;
  margin-right: 20px;
  margin-top: 10px;
  color: var(--text_secondary);
  font-size: 14px;
}

.Avatar-transparent .Avatar__img {
  background: transparent!important;
}

.MyInput {
  margin-left: 6px;
  margin-right: 6px;
  width: calc(100% - 12px);
}

.MyIcon28 {
  width: 28px!important;
  height: 28px!important;
}

.MyIcon28 > svg {
  width: 28px!important;
  height: 28px!important;
}

.BallonClear {
  padding: 0!important;
  background: transparent;
  border: 0;
}

</style>
