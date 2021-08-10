import type { PiniaPluginContext } from 'pinia';
import createStack from 'undo-stacker';

type Store = PiniaPluginContext['store'];
type Options = PiniaPluginContext['options'];

/**
 * Removes properties from the store state.
 * @param options The options object defining the store passed to `defineStore()`.
 * @param store The store the plugin is augmenting.
 * @returns {Object} State of the store without omitted keys.
 */
function removeOmittedKeys(options: Options, store: Store): Store['$state'] {
  const clone = JSON.parse(JSON.stringify(store.$state));
  if (options.undo && options.undo.omit) {
    options.undo.omit.forEach((key) => {
      delete clone[key];
    });
    return clone;
  }
  return clone;
}

export function PiniaUndo({ store, options }: PiniaPluginContext) {
  if (options.undo && options.undo.disable) return;
  const stack = createStack(removeOmittedKeys(options, store));
  let preventUpdateOnSubscribe = false;
  store.undo = () => {
    preventUpdateOnSubscribe = true;
    store.$patch(stack.undo());
  }
  store.redo = () => {
    preventUpdateOnSubscribe = true;
    store.$patch(stack.redo());
  }
  store.$subscribe(() => {
    if (preventUpdateOnSubscribe) {
      preventUpdateOnSubscribe = false;
      return;
    }
    stack.push(removeOmittedKeys(options, store));
  })
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    undo: () => void;
    redo: () => void;
  }

  export interface DefineStoreOptionsBase<S, Store> {
    undo?: {
      disable?: boolean;
      omit?: string[];
    }
  }
}