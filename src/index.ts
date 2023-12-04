import type { PiniaPluginContext } from 'pinia'
import structuredClone from '@ungap/structured-clone'
import createStack from 'undo-stacker'
import { toRaw } from 'vue'

type Store = PiniaPluginContext['store']
type Options = PiniaPluginContext['options']

/**
 * Removes properties from the store state.
 * @param options The options object defining the store passed to `defineStore()`.
 * @param store The store the plugin is augmenting.
 * @returns {object} State of the store without omitted keys.
 */
function removeOmittedKeys(options: Options, store: Store): Store['$state'] {
  const clone = structuredClone(toRaw(store.$state))
  if (options.undo && options.undo.omit) {
    options.undo.omit.forEach((key) => {
      delete clone[key]
    })
    return clone
  }
  return clone
}

/**
 * Adds Undo/Redo properties to your store.
 *
 * @example
 *
 * ```ts
 * import { PiniaUndo } from 'pinia-undo'
 *
 * // Pass the plugin to your application's pinia plugin
 * pinia.use(PiniaUndo)
 * ```
 */
export function PiniaUndo({ store, options }: PiniaPluginContext) {
  if (options.undo && options.undo.disable)
    return
  const stack = createStack(removeOmittedKeys(options, store))
  let preventUpdateOnSubscribe = false
  store.undo = () => {
    preventUpdateOnSubscribe = true
    store.$patch(stack.undo())
  }
  store.redo = () => {
    preventUpdateOnSubscribe = true
    store.$patch(stack.redo())
  }
  store.$subscribe(() => {
    if (preventUpdateOnSubscribe) {
      preventUpdateOnSubscribe = false
      return
    }
    stack.push(removeOmittedKeys(options, store))
  }, {
    flush: 'sync',
  })
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    /**
     * Undo/Redo a state.
     *
     * @example
     *
     * ```ts
     * const counterStore = useCounterStore()
     *
     * counterStore.increment();
     * counterStore.undo();
     * counterStore.redo();
     * ```
     */
    undo: () => void
    redo: () => void
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * Disable or ignore specific fields.
     *
     * @example
     *
     * ```js
     * defineStore({
     *   id: 'counter',
     *   state: () => ({ count: 0, foo: 'bar' })
     *   undo: {
     *     // An array of fields that the plugin will ignore.
     *     omit: ['name'],
     *     // Disable history tracking of this store.
     *     disable: true
     *   }
     * })
     * ```
     */
    undo?: {
      disable?: boolean
      omit?: Array<keyof S>
    }
  }
}
