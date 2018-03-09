<script>
export default {
  props: {
    renderProxy: {
      type: Function,
      default: null
    },
    radioProxy: {
      type: Function,
      default: null
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "text"
    },
    options: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    checked: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: ""
    },
    validity: {
      //type: ValidityState,
      // As of now, JSDOM doesn't support Validity API
      // https://github.com/jsdom/jsdom/issues/544
      type: null,
      default: null
    }
  },
  computed: {
    fieldProps() {
      const props = Object.assign({}, this.$props);
      delete props.renderProxy;

      return props;
    },
    isSingleInput() {
      return !["select", "textarea", "radio"].includes(this.type);
    },
    isRadio() {
      return this.type === "radio";
    }
  },
  methods: {
    /**
     * @param {Event} event
     */
    emitChange(event) {
      event.preventDefault();
      this.$emit("change", this.name, { value: event.target.value, checked: event.target.checked });
    },

    /**
     * @param {Function} createElement Vue's createElement function
     *
     * @return {Object}
     */
    createOwnElement(createElement) {
      const node = this.isSingleInput
        ? "input"
        : this.isRadio
          ? "div"
          : this.type;

      const attrs = {};

      if (!this.isRadio) {
        attrs.name = this.name;
        attrs.required = this.required;
      }

      if (this.isSingleInput) {
        attrs.type = this.type;
        attrs.value = this.value;
      } else if (this.type === "select") {
        attrs.multiple = this.multiple;
      }

      if (this.pattern) {
        attrs.pattern = this.pattern;
      }

      if (this.type === "checkbox") {
        attrs.checked = this.checked;
      }

      let content = null;

      if (this.type === "select") {
        content = this.options.map(option => createElement("option", {
          attrs: {
            value: option.value,
            selected: option.value === this.value
          }
        }, option.label));
      } else if (this.type === "textarea") {
        content = this.value;
      } else if (this.isRadio) {
        content = this.options.map(option => {
          const element = createElement("input", {
            attrs: {
              name: this.name,
              type: "radio",
              value: option.value,
              checked: option.value === this.value,
              required: this.required
            },
            on: { input: this.emitChange }
          });

          if (typeof this.radioProxy === "function") {
            return this.radioProxy(createElement, element, option.label);
          }

          return createElement("label", [element, option.label]);
        });
      }

      const data = { attrs };

      if (!this.isRadio) {
        data.on = { input: this.emitChange };
      }

      return createElement(node, data, content);
    }
  },

  /**
   * @param {Function} createElement
   *
   * @return {Object}
   */
  render(createElement) {
    const element = this.createOwnElement(createElement);

    if (typeof this.renderProxy === "function") {
      return this.renderProxy(createElement, element, this.fieldProps);
    }

    return element;
  }
};
</script>
