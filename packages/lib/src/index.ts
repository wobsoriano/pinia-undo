import { PiniaPluginContext } from 'pinia';
import createStack from 'undo-stacker';
import { markRaw } from 'vue-demi';

let isRegistered = false;

export default function PiniaPluginUndo({ store }: PiniaPluginContext) {
  if (!isRegistered) {
    const stack = createStack({ ...store.$state });
    store.undo = markRaw(() => {
      store.$state = stack.undo()
    });
    store.redo = markRaw(() => {
      store.$state = stack.redo()
    });
    store.$subscribe(() => {
      stack.push({ ...store.$state });
    });
    isRegistered = true;
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    undo: () => void;
    redo: () => void;
  }
}