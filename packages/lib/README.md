# pinia-undo

Enable time-travel in your apps. Undo/Redo plugin for pinia.

## Install

```sh
yarn add pinia@next pinia-undo
```

## Usage

Since it's a plugin, use it like:

```js
const pinia = createPinia()
pinia.use(PiniaUndo)
```

This adds `undo` and `redo` properties to your stores.

```js
const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    count: 10,
  }),
  actions: {
    increment() {
        this.count++
    }
  }
});

const counterStore = useCounterStore()

// undo/redo have no effect if we're at the
// beginning/end of the stack
counterStore.undo() // { count: 10 }
counterStore.redo() // { count: 10 }

counterStore.increment() // { count: 11 }
counterStore.increment() // { count: 12 }

counterStore.undo() // { count: 11 }
counterStore.undo() // { count: 10 }
counterStore.undo() // { count: 10 }

counterStore.redo() // { count: 11 }
```

## Options

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`omit` | `array` | `[]` | An array of fields that the plugin will ignore. |
`disable` | `boolean` | `false` | Disable history tracking of store. |

```js
const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    count: 10,
    name: 'John Doe'
  }),
  undo: {
    omit: ['name']
  }
});
```

## Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.

## License

[MIT License](http://opensource.org/licenses/MIT).