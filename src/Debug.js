let debug = [];

export default {
  log: (o) => {
    console && console.log(o);
    debug.push(o);
  },

  get() {
    return debug
  }
}
