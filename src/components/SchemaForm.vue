<template>
  <form
    novalidate
    @submit.prevent="onSubmit"
  >
    <SchemaFormField
      v-for="field in schemaWithValidities"
      :key="field.name"
      :ref="field.name"
      :renderProxy="renderChild"
      :radioProxy="renderRadio"
      v-bind="field"
      @change="onChange"
    /><slot></slot>
  </form>
</template>

<script>
import findFieldInNode from "../findFieldInNode";
import SchemaFormField from "./SchemaFormField";

export default {
  props: {
    schema: {
      type: Array,
      required: true
    },
    renderChild: {
      type: Function,
      default: null
    },
    renderRadio: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      fields: this.schema.reduce((fields, field) => ({
        ...fields,
        [field.name]: {
          type: field.type || "text",
          value: field.value,
          checked: field.checked,
          validity: null
        }
      }), {})
    };
  },
  computed: {
    schemaWithValidities() {
      return this.schema.map(field => Object.assign({}, field, {
        value: this.fields[field.name].value,
        checked: !!this.fields[field.name].checked,
        validity: this.fields[field.name].validity
      }));
    }
  },
  methods: {
    /**
     * @return {Promise}
     */
    validate() {
      return new Promise((resolve, reject) => {
        const fields = Object.assign({}, this.fields);
        let isValid = true;

        for (const fieldName in fields) {
          let node = this.$refs[fieldName][0].$el;

          if (fields[fieldName].type === "radio" || typeof this.renderChild === "function") {
            node = findFieldInNode(node, fieldName);
          }

          isValid = isValid && node.checkValidity();
          fields[fieldName].validity = node.validity;
        }

        this.fields = fields;

        if (isValid) {
          resolve(this.fields);
        } else {
          reject(this.fields);
        }
      });
    },

    /**
     * @param {String} fieldName
     * @param {Object} data
     */
    onChange(fieldName, data) {
      const field = Object.assign({}, this.fields[fieldName], data);
      this.fields = Object.assign({}, this.fields, { [fieldName]: field });
    },

    onSubmit() {
      this.$emit("submit", this.validate());
    }
  },
  components: { SchemaFormField }
};
</script>
