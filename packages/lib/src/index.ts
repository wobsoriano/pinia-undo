import type { PiniaPluginContext } from 'pinia';
import createStack from 'undo-stacker';

const registeredStoreIds: Record<string, boolean> = {};

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
  if (!registeredStoreIds[store.$id]) {
    if (options.undo && options.undo.disable) return;
    const stack = createStack(removeOmittedKeys(options, store));
    store.undo = () => {
      store.$state = {
        ...store.$state,
        ...stack.undo()
      }
    };
    store.redo = () => {
      store.$state = {
        ...store.$state,
        ...stack.redo()
      }
    };
    store.$subscribe(() => {
      stack.push(removeOmittedKeys(options, store));
    });
    registeredStoreIds[store.$id] = true;
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    undo: () => void;
    redo: () => void;
  }

  export interface DefineStoreOptions<Id extends string, S extends StateTree, G extends GettersTree<S>, A> {
    undo?: {
      disable?: boolean;
      omit?: string[];
    }
  }
}