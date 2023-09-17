const Init = (function () {
  const fns = [];

  /** Registers a function which will be called when the page finishes loading */
  function register(fn) {
    fns.push(fn);
  }

  /** Called when the page finishes loading */
  function init() {
    for (const fn of fns) {
      fn();
    }
  }

  return { register, init };
})();
