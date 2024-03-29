# pinia-undo

Enable time-travel in your apps. Undo/Redo plugin for pinia.

Requires Vue ^2.6.14 || ^3.2.0

## Install

```sh
pnpm add pinia pinia-undo
```

## Usage

```js
import { PiniaUndo } from 'pinia-undo'

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
    },
  },
})

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
`serializer` | `object` | `{ serializer: JSON.stringify, deserializer: JSON.parse }` | Custome serializer to serialize state before storing it in the undo stack. |

```js
const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    count: 10,
    name: 'John Doe',
  }),
  undo: {
    omit: ['name'],
  },
})
```

## License

MIT.
