let debug = [];

export default {
  log: (o) => {
    console && console.log(o);
    debug = debug.concat(o);
  },

  get: debug
}
