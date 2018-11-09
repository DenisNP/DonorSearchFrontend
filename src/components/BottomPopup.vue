<template>
  <div class="BottomPopup"
  :style="cssProps"
  :class="{
    hidden: !opened,
    opened: opened,
    collapsed: opened && collapsed
  }">
    <div
      class="ClickHandler"
      v-if="opened && outsideClickEnabled"
      @click="clickedOutside">
    </div>
    <div class="BottomPopupContainer">
      <slot/>
    </div>
  </div>

</template>

<script>

export default {
  name: 'BottomPopup',
  props: {
    opened: Boolean,
    collapsed: Boolean,
    outsideClickEnabled: Boolean,
    collapsedHeight: Number,
    openedHeight: Number
  },
  data() {
    return {

    };
  },
  computed: {
    cssProps() {
      let ch = this.collapsedHeight || 100;
      let oh = this.openedHeight || 300;
      return {
        '--collapsed-height': ch + 'px',
        '--opened-height': oh + 'px'
      }
    }
  },
  methods: {
    clickedOutside() {
      this.$emit('clickedOutside');
    }
  }
}

</script>

<style scoped>

.ClickHandler {
  position: fixed;
  z-index: 1;
  opacity: 0;
  width: 100vw;
  height: 100vh;
}

.opened > .ClickHandler {
  bottom: calc(var(--opened-height));
}

.collapsed > .ClickHandler {
  bottom: calc(var(--collapsed-height));
}

</style>

<style>

.BottomPopupContainer {
  background-color: #FFF;
  text-align: center;
  box-shadow: 0 0 10px 0 rgba(0,0,0,.1);
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  height: 100vh;
}

.BottomPopup {
  position: fixed;
  left: 0;
  width: 100vw;
  z-index: -1;
  overflow: visible;

  -webkit-transition: all 300ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
     -moz-transition: all 300ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
       -o-transition: all 300ms cubic-bezier(0.770, 0.000, 0.175, 1.000);
          transition: all 300ms cubic-bezier(0.770, 0.000, 0.175, 1.000);

  -webkit-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
     -moz-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
       -o-transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
          transition-timing-function: cubic-bezier(0.770, 0.000, 0.175, 1.000);
}
.BottomPopup.hidden {
  bottom: -100vh;
}
.BottomPopup.collapsed {
  bottom: calc(var(--collapsed-height) - 100vh)!important;
  z-index: 2;
}
.BottomPopup.opened {
  bottom: calc(var(--opened-height) - 100vh);
  z-index: 2;
}

</style>
