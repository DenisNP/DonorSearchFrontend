let debug = [];

export default {
  log: () => {
    console && console.log(arguments);
    debug = debug.concat(arguments);
  },

  get: debug
}
