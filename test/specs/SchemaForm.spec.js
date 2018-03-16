import Vue from "vue/dist/vue.common";
import SchemaForm from "../../src/components/SchemaForm";

const Constructor = Vue.extend(SchemaForm);

const schema = [
  {
    name: "field1",
    value: "Hello",
    required: true
  },
  {
    name: "leselect",
    type: "select",
    multiple: true,
    options: [
      {
        label: "One",
        value: "1"
      },
      {
        label: "Two",
        value: "2"
      }
    ],
    value: "2"
  },
  {
    name: "leradio",
    type: "radio",
    options: [
      {
        label: "Three",
        value: "3"
      },
      {
        label: "Four",
        value: "4"
      }
    ],
    value: "3"
  },
  {
    name: "lecb",
    type: "checkbox",
    checked: true,
    required: true,
    value: "5"
  }
];

const badSchema = [
  {
    name: "field1",
    value: "Hello",
    required: true
  },
  {
    name: "field2",
    value: "",
    required: true
  }
];

function renderChild(createElement, element, field) {
  return createElement("div", { class: "foo" }, [
    createElement("p", field.name),
    createElement("label", { class: "bar" }, [
      createElement("p", field.validity ? field.validity.valid ? "YEAH" : "NOPE" : ""),
      element
    ])
  ]);
}

function renderRadio(createElement, element, label) {
  return createElement("div", { class: "baz" }, [
    createElement("p", label),
    createElement("span", { class: "kek" }, [element])
  ]);
}

describe("SchemaForm", () => {
  it("should render a basic form given a JSON schema", () => {
    const vm = new Constructor({ propsData: { schema } }).$mount();

    expect(vm.$el.outerHTML).toEqual([
      "<form novalidate=\"novalidate\"><input name=\"field1\" required=\"required\" type=\"text\" value=\"Hello\">",
      "<select multiple=\"multiple\" name=\"leselect\">",
      "<option value=\"1\">One</option><option value=\"2\" selected=\"selected\">Two</option></select>",
      "<div><label><input name=\"leradio\" type=\"radio\" value=\"3\" checked=\"checked\">Three</label>",
      "<label><input name=\"leradio\" type=\"radio\" value=\"4\">Four</label></div>",
      "<input name=\"lecb\" required=\"required\" type=\"checkbox\" value=\"5\" checked=\"checked\"></form>"
    ].join(""));
  });

  it("should render a form with custom rendering functions", () => {
    const vm = new Constructor({ propsData: { schema, renderChild, renderRadio } }).$mount();

    expect(vm.$el.outerHTML).toEqual([
      "<form novalidate=\"novalidate\"><div class=\"foo\"><p>field1</p><label class=\"bar\"><p></p>",
      "<input name=\"field1\" required=\"required\" type=\"text\" value=\"Hello\"></label></div>",
      "<div class=\"foo\"><p>leselect</p><label class=\"bar\"><p></p>",
      "<select multiple=\"multiple\" name=\"leselect\"><option value=\"1\">One</option>",
      "<option value=\"2\" selected=\"selected\">Two</option></select></label></div>",
      "<div class=\"foo\"><p>leradio</p><label class=\"bar\"><p></p><div><div class=\"baz\"><p>Three</p>",
      "<span class=\"kek\"><input name=\"leradio\" type=\"radio\" value=\"3\" checked=\"checked\"></span></div>",
      "<div class=\"baz\"><p>Four</p><span class=\"kek\"><input name=\"leradio\" type=\"radio\" value=\"4\">",
      "</span></div></div></label></div><div class=\"foo\"><p>lecb</p><label class=\"bar\"><p></p>",
      "<input name=\"lecb\" required=\"required\" type=\"checkbox\" value=\"5\" checked=\"checked\"></label></div></form>"
    ].join(""));
  });

  it("should correctly mark all radio buttons required in a radio group if relevant", () => {
    const vm = new Constructor({
      propsData: {
        schema: [{
          name: "leradio",
          type: "radio",
          required: true,
          options: [
            {
              label: "Three",
              value: "3"
            },
            {
              label: "Four",
              value: "4"
            }
          ],
          value: "3"
        }]
      }
    }).$mount();

    expect(vm.$el.innerHTML).toEqual([
      "<div><label>",
      "<input name=\"leradio\" type=\"radio\" value=\"3\" checked=\"checked\" required=\"required\">Three</label>",
      "<label><input name=\"leradio\" type=\"radio\" value=\"4\" required=\"required\">Four</label></div>"
    ].join(""));
  });

  it("should correctly emit validity states for form elements", () => {
    const vm = new Constructor({ propsData: { schema: badSchema } }).$mount();

    vm.validate()
      .then(() => {
        expect(true).toBe(false); // this should not be executed
      })
      .catch(fields => {
        expect(fields.field1.validity.valid).toBe(true);
        expect(fields.field2.validity.valid).toBe(false);
        expect(fields.field2.validity.valueMissing).toBe(true);
      });
  });

  it("should correctly display validity state for form elements", done => {
    const vm = new Constructor({ propsData: { schema: badSchema, renderChild } });
    vm.$on("submit", validation => validation.catch(fields => {})); // we have to catch the Promise rejection
    vm.$mount();

    vm.$el.dispatchEvent(new window.Event("submit"));

    vm.$nextTick(() => {
      // Remove hyperform extra attributes
      Array.from(vm.$el.querySelectorAll("input")).forEach(input => {
        input.removeAttribute("class");
        input.removeAttribute("aria-invalid");
      });

      expect(vm.$el.innerHTML).toEqual([
        "<div class=\"foo\"><p>field1</p><label class=\"bar\"><p>YEAH</p>",
        "<input name=\"field1\" required=\"required\" type=\"text\" value=\"Hello\"></label></div>",
        "<div class=\"foo\"><p>field2</p><label class=\"bar\"><p>NOPE</p>",
        "<input name=\"field2\" required=\"required\" type=\"text\" value=\"\"></label></div>"
      ].join(""));

      done();
    });
  });
});
