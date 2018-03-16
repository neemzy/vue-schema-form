/* global global */
import Vue from "vue/dist/vue.common";
import * as hyperform from "hyperform";

Vue.config.productionTip = false;

// Polyfill ValidityState API in JSDOM
global.ValidityState = hyperform.ValidityState;

["Input", "Select", "TextArea"].map(type => "HTML" + type + "Element").forEach(key => {
  global[key].prototype.checkValidity = function() {
    return hyperform.checkValidity(this);
  };

  Object.defineProperty(global[key].prototype, "validity", {
    get() {
      return hyperform.ValidityState(this);
    },
    configurable: true
  });
});
