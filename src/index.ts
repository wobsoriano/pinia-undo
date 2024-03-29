import type { PiniaPluginContext } from 'pinia'
import createStack from 'undo-stacker'

type Store = PiniaPluginContext['store']
type Options = PiniaPluginContext['options']

interface Serializer {
  serialize: (value: any) => string
  deserialize: (value: string) => any
}

/**
 * Removes properties from the store state.
 * @param options The options object defining the store passed to `defineStore()`.
 * @param store The store the plugin is augmenting.
 * @param serializer Custome serializer to serialize state before storing it in the undo stack.
 * @returns {object} State of the store without omitted keys.
 */
function removeOmittedKeys(
  options: Options,
  store: Store,
  serializer: Serializer = { serialize: JSON.stringify, deserialize: JSON.parse },
): Store['$state'] {
  const clone = serializer.deserialize(serializer.serialize(store.$state))
  if (options.undo && options.undo.omit) {
    options.undo.omit.forEach((key) => {
      delete clone[key]
    })
    return clone
  }
  return clone
}

type PluginOptions = PiniaPluginContext & {
  /**
   * Custome serializer to serialize state before storing it in the undo stack.
   */
  serializer?: Serializer
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
export function PiniaUndo({ store, options, serializer }: PluginOptions) {
  if (options.undo && options.undo.disable)
    return
  let stack = createStack(removeOmittedKeys(options, store, serializer))
  let preventUpdateOnSubscribe = false
  store.undo = () => {
    preventUpdateOnSubscribe = true
    store.$patch(stack.undo())
  }
  store.redo = () => {
    preventUpdateOnSubscribe = true
    store.$patch(stack.redo())
  }
  store.resetStack = () => {
    stack = createStack(removeOmittedKeys(options, store, serializer))
  }
  store.$subscribe(() => {
    if (preventUpdateOnSubscribe) {
      preventUpdateOnSubscribe = false
      return
    }
    stack.push(removeOmittedKeys(options, store, serializer))
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
     *
     * counterStore.$reset();
     * counterStore.resetStack();
     * ```
     */
    undo: () => void
    redo: () => void
    resetStack: () => void
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
