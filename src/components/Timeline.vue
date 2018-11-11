<template>
  <VKView :activePanel="activePanel" v-bind="$attrs">
      <ActionSheet v-if="sheetOpened" slot="popout"
        :onClose="sheetClose"
        text="Запись на сдачу"
      >
        <ActionSheetItem @click="sheetClose">Сохранить дату</ActionSheetItem>
        <ActionSheetItem @click="cancelDate" theme="destructive">Отмена</ActionSheetItem>
      </ActionSheet>

      <ActionSheet v-if="sheetConfirmOpened" slot="popout"
        :onClose="sheetClose"
        text="Запись на подтверждение"
      >
        <ActionSheetItem @click="sheetConfirmClose">Сохранить дату</ActionSheetItem>
        <ActionSheetItem @click="cancelConfirmDate" theme="destructive">Отмена</ActionSheetItem>
      </ActionSheet>

      <ScreenSpinner slot="popout" v-if="loader"/>

    <Panel id="defTimeline">
      <PanelHeader>Мои события</PanelHeader>
      <div class="timeline">
        <div class="left-column"></div>
        <div class="right-column Avatar-transparent">
          <!-- First subscribtion -->
          <div class="balloon" v-show="timeline.appointment_date_from && timeline.appointment_date_to && !timeline.station_id">
            <div class="timeline-date">
              <span style="display: block;">{{ showDate(timeline.appointment_date_from) }}</span> <span class="dash"></span> <span>{{ showDate(timeline.appointment_date_to) }}</span>
            </div>
            <vkui-icon name="recent_outline" :size="28" :style="{color: '#ffc000', 'margin-top': '6px'}"/>
            <div class="balloon-content">
              <Group title="Запись на сдачу крови">
                <Input v-show="userCanStartTimeline" class="MyInput" type="date" v-model="donationDate" />
                <CellButton v-show="userCanStartTimeline" @click="activePanel = 'warnings'">Противопоказания</CellButton>
                <Div v-show="!userCanStartTimeline">
                  Ближайшая возможная дата записи для вас ещё не скоро, мы уведовим вас при её приближении
                </Div>
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
              <Button size="xl" level="primary" @click="activePanel = 'recommendations'">Памятка к сдаче</Button>
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

                <div style="display:flex;" v-show="datePassed(timeline.donation_date)" >
                  <!-- <File size="l" class="button-margin" @change="photoSelected(true)">
                    <vkui-icon name="camera" :size="24"></vkui-icon>

                  </File> -->

                  <Button size="l" component="label" class="button-margin">
                    <input class="File__input" type="file" @change="photoSelected(true)"/>
                    <vkui-icon name="camera" :size="24"></vkui-icon>
                  </Button>
                  <Button size="l" level="secondary" style="display: flex;" class="button-margin" @click="photoSelected(false)">
                    Отменить
                  </Button>
                </div>
              <!-- </Group> -->
            </div>
          </div>
          <!-- Confirm visit -->
          <div class="balloon" v-show="timeline.confirm_visit.date_from && timeline.confirm_visit.date_to">
            <div class="timeline-date">
              <span style="display:block;">{{ showDate(timeline.confirm_visit.date_from) }}</span> <span class="dash"></span> <span>{{ showDate(timeline.confirm_visit.date_to) }}</span>
            </div>
            <vkui-icon name="user_added" class="MyIcon28" :size="24" :style="{color: '#27ae60', 'margin-top': '6px'}"/>
            <div class="balloon-content">
              <Group title="Повторный визит">
                <Input class="MyInput" type="date" v-model="confirmDate" />
                <Checkbox v-show="datePassed(timeline.confirm_visit.visit_date)" v-model="withoutDonation">Подтверждение без сдачи</Checkbox>
                <div style="display:flex;" v-show="datePassed(timeline.confirm_visit.visit_date)" >
                  <Button @click="approved(true)" class="button-margin">
                    Подтвердить
                  </Button>
                  <Button level="secondary"  class="button-margin" @click="approved(false)">
                    Отменить
                  </Button>
                </div>
              </Group>
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

import { VKView, Panel, PanelHeader, Cell, Avatar, Button, CellButton, Group, Input, Div, Checkbox, ScreenSpinner, File } from '@denull/vkui/src/components'
import DSProfile from '../DSProfile'
import EventBus from '../EventBus'
import DSApi from '../DSApi'

export default {
  name: 'Timeline',
  props: {

  },
  data() {
      return {
        timeline: DSProfile.timeline,
        activePanel: "defTimeline",
        withoutDonation: false,
        sheetOpened: false,
        sheetConfirmOpened: false,
        donationDate: null,
        loader: false,
        confirmDate: null,
        lastStationId: null
      }
  },
  computed: {
    userCanStartTimeline() {
      if(this.timeline.donation_date
        || !this.timeline.appointment_date_from
        || !this.timeline.appointment_date_to)
       return false;

      let dFrom = new Date(this.timeline.appointment_date_from);
      let dTo = new Date(this.timeline.appointment_date_to);
      let dn = Date.now();
      let diff = dFrom - dn;
      return dTo >= dn && diff <= 3600000*24*7;
    }
  },
  methods: {
    showDate(d) {
      if(!d) return "";
      let date = new Date(d);
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    },
    datePassed(d) {
      if(!d) return false;
      let _d = new Date(d);
      return _d.getTime() <= Date.now();
    },
    sheetClose() {
      this.sheetOpened = false;
      if(!this.lastStationId)
        EventBus.$emit('show-map');
      else
        this.checkSendDate();
    },
    cancelDate() {
      this.donationDate = null;
      let self = this;
      this.$nextTick(() => {
        self.sheetOpened = false;
      });
    },
    sheetConfirmClose() {
      this.sheetConfirmOpened = false;
      if(this.confirmDate) {
        this.timeline.confirm_visit.visit_date = this.dateToJson(this.confirmDate);
        this.loader = true;
        this.sendTimeline();
      }
    },
    cancelConfirmDate() {
      this.confirmDate = null;
      let self = this;
      this.$nextTick(() => {
        self.sheetConfirmOpened = false;
      });
    },
    photoSelected(val) {
      //if(val) {
        let self = this;
        self.loader = true;
        timeline.success = !!val;

        this.sendTimeline();
      //}
    },
    approved(val) {
      this.timeline.confirm_visit.without_donation = !!this.withoutDonation;
      this.loader = true;
      this.sendTimeline();
    },
    checkSendDate() {
      if(this.lastStationId && this.donationDate) {
        this.loader = true;
        let self = this;
        timeline.donation_date = this.dateToJson(this.donationDate);
        timeline.station_id = this.lastStationId;
        this.sendTimeline();
      }
    },
    dateToJson(d) {
      return new Date(d).toJSON();
    },
    sendTimeline() {
      let self = this;
      DSApi.send('/api/donations', this.timeline, (res) => {
        self.loader = false;
        DSProfile.timeline = Object.assign(self.timeline, res);
      }, (err) => {
        self.loader = false;
      });
    }
  },
  watch: {
    donationDate(val) {
      if(val)
        this.sheetOpened = true;
    },
    confirmDate(val) {
      if(val)
        this.sheetConfirmOpened = true;
    }
  },
  mounted() {
    let self = this;
    EventBus.$on('subscribe-station', (id) => {
      self.lastStationId = id;
      self.checkSendDate();
    });

    EventBus.$on('timeline-opened', () => {
      self.loader = true;
      DSApi.send('/api/donations/' + DSProfile.data.vk_id + '?type=timeline', {}, (res) => {
        self.loader = false;
        DSProfile.timeline = Object.assign(self.timeline, res);
      }, (err) => {
        self.loader = false;
      });
    });
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
    Div,
    Checkbox,
    ScreenSpinner,
    File
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
  max-width: calc(100% - 83px);
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

.dash {
  display: block;
  height: 40px;
  margin-top: 5px;
  margin-bottom: 5px;
  /* margin-right: 20px; */
  width: calc(100% - 7px);
  border-right: 2px dotted var(--text_secondary);
}

.button-margin {
  /* margin-right: 6px; */
  margin-left: 6px;
  margin-bottom: 10px;
}

</style>
