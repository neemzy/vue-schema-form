# vue-schema-form

Generate and validate forms from a JSON schema in a breeze

## Motivation

Form validation is hard. One of the hardest parts may be validating user input on *both* client and server:

- validating clientside only is a huge security breach
- validating serverside only generates unnecessary requests to yield errors you could have spotted early on
- validating both requires extra care to make sure they don't get out of sync

Enter **vue-schema-form**: this library will handle **both rendering and clientside validation** (based on the native [ValidityState API](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)) of your forms in Vue.js, **based on a JSON schema** you can craft on the server alongside your constraints. You can finally get the best of both worlds without even needing to think about it!

*Of course, the library does not aim at covering every single use case you might encounter, but it is flexible enough to fulfill your requirements most of the time.*

## How does it work?

- Instantiate the component
- Feed it a JSON schema describing your form fields and their validation constraints
- Listen to its `submit` event
- Add any extra required markup (like a submit button, that may come in handy) inside it
- You're done!

```html
<schema-form
  :schema="..."
  @submit="..."
>
  <button type="submit">Clickey!</button>
</schema-form>
```

### The JSON schema

The component expects an array of objects, each representing a field.

#### Basic input

```js
{
  type: 'text',  // default; can be 'email', 'password'...
  name: 'foo',   // directly passed to the underlying element
  value: 'Hello' // must be a string; can of course be bound to your component's data
}
```

#### Checkbox

```js
{
  type: 'checkbox',
  name: 'bar',
  checked: true     // can be bound, too
}
```

#### Dropdown / radio group

```js
{
  type: 'select', // or 'radio'
  name: 'baz',
  multiple: true, // optional; false by default (only works for 'select')
  options: [{
    label: 'One',
    value: '1'    // must be a string
  }, {
    label: 'Two',
    value: '2'
  }],
  value: '2'      // currently selected option; can be bound as well (and must be a string, too)
}
```

### Validation constraints

Any field described in your schema can also contain any of the following properties:

| Key        | Value type |
| ---------- | ---------- |
| `required` | Boolean    |
| `pattern`  | String     |

When present, these properties will be applied as native attributes on the underlying elements, and used for validation upon form submission.

### The `onSubmit` handler

When the form is submitted, the component will emit a `submit` event, to which you should attach a listener.

The listener will receive a `Promise` as a parameter, which will be resolved if the validation is successful and rejected otherwise. In both cases, it will receive the list of submitted values in a simple format.

```js
onSubmit(validation) {
  validation
    .then(fields => { // success handler
      for (let fieldName in fields) {
        console.log(fieldName, fields[fieldName].type === 'checkbox'
          ? (fields[fieldName].checked ? 'checked' : 'not checked')
          : fields[fieldName].value
        );
      }
    })
    .catch(fields => { // error handler
      for (let fieldName in fields) {
        console.log(fieldName, fields[fieldName].validity);
      }
    });
}
```

### Custom markup

By default, the library uses minimal markup to render your form. Of course, it allows customization through the use of two extra props:

```html
<schema-form
  :schema="..."
  :renderChild="renderChild"
  :renderRadio="renderRadio"
  @submit="..."
>
  <button type="submit">Clickey!</button>
</schema-form>
```

#### `renderChild`

This function is used to wrap the rendered form element in any markup you need. It takes three arguments:

- `createElement`: Vue's own [eponymous function](https://vuejs.org/v2/guide/render-function.html#createElement-Arguments)
- `element`: the rendered form element
- `field`: the initial data (including the current validity state at `field.validity`)

```js
renderChild(createElement, element, field) {
  return createElement('div', { class: 'foo' }, [
    createElement('p', field.name),
    createElement('label', { class: 'bar' }, [
      createElement('p', field.validity ? (field.validity.valid ? 'YEAH' : 'NOPE') : ''),
      element
    ])
  ]);
}
```

#### `renderRadio`

Radio buttons are handled in a specific way: by default, each is wrapped in a `<label>` tag, which includes the option label alongside the radio button itself. Use this function if you wish to customize this behaviour. It takes three arguments as well:

- `createElement`: Vue's own [eponymous function](https://vuejs.org/v2/guide/render-function.html#createElement-Arguments)
- `element`: the rendered radio button
- `label`: the option label

```js
renderRadio(createElement, element, label) {
  return createElement('div', { class: 'baz' }, [
    createElement('p', label),
    createElement('span', { class: 'kek' }, [element])
  ]);
}
```

## Unit tests

To run unit tests, do the following:

```
$ npm install
$ npm test
```
