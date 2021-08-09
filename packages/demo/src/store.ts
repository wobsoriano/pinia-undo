import { defineStore } from 'pinia';

export const useCounterStore = defineStore({
  id: 'counter',

  state: () => ({
    count: 0,
    name: 'john'
  }),

  getters: {
    doubleCount: (state) => state.count * 2
  },

  actions: {
    increment() {
        this.count++;
    },
    decrement() {
        if (!this.count) return;
        this.count--;
    }
  },

});