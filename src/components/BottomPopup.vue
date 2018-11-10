<template>
  <div v-pan="onPan" class="BottomPopup"
  :style="cssProps"
  :class="{
    hidden: !opened,
    opened: opened,
    collapsed: opened && collapsed,
    fast: isMoving
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
    collapsible: {
      type: Boolean,
      default: false
    },
    outsideClickEnabled: Boolean,
    collapsedHeight: Number,
    openedHeight: Number,
    collapsedOnStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      translateY: 0,
      isMoving: false,
      collapsed: this.collapsedOnStart
    };
  },
  computed: {
    cssProps() {
      return {
        '--collapsed-height': (this.colHeight - this.translateY) + 'px',
        '--opened-height': (this.openHeight - this.translateY) + 'px'
      }
    },
    colHeight() {
      return this.collapsedHeight || 150;
    },
    openHeight() {
      return this.openedHeight || 300;
    }
  },
  methods: {
    clickedOutside() {
      this.$emit('close');
      this.collapsed = this.collapsedOnStart;
    },
    onPan(e) {
      //console && console.log(e);
      let t = e.deltaY;
      let limit = this.openHeight * 0.5;
      if(t < -limit) {
        this.translateY = -limit;
      }else{
        this.translateY = t;
      }

      this.isMoving = true;

      if(e.isFinal) {
        this.translateY = 0;
        this.isMoving = false;

        let diff = (this.openHeight - this.colHeight);
        if(this.collapsed) {
          if(t < -0.3 * diff) {
            this.collapsed = false;
          } else if (t >= 0.3 * this.colHeight ){
            this.$emit('close');
            this.collapsed = this.collapsedOnStart;
          }
        } else {
          if(this.collapsible) {
            if(t > 0.5 * diff && t < diff - (-this.colHeight * 0.3)) {
              this.collapsed = this.collapsible;
            } else if(t > this.openHeight * 0.45) {
              this.$emit('close');
              this.collapsed = this.collapsedOnStart;
            }
          }else{
            if(t > this.openHeight * 0.55) {
              this.$emit('close');
              this.collapsed = this.collapsedOnStart;
            }
          }
        }
      }
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

.BottomPopup.fast {
  -webkit-transition: 0s;
     -moz-transition: 0s;
       -o-transition: 0s;
          transition: 0s;

  -webkit-transition-timing-function: linear;
     -moz-transition-timing-function: linear;
       -o-transition-timing-function: linear;
          transition-timing-function: linear;
}

.BottomPopup.hidden {
  bottom: -100vh;
}
.BottomPopup.collapsed {
  bottom: calc(var(--collapsed-height) - 100vh)!important;
  z-index: 20;
}
.BottomPopup.opened {
  bottom: calc(var(--opened-height) - 100vh);
  z-index: 20;
}

</style>
