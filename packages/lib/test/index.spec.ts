import { setActivePinia, createPinia, defineStore } from 'pinia';
import { createApp } from 'vue';
import { PiniaUndo } from '../src';

const factory = (id: string, options?: { omit?: string[], disable?: boolean }) => {
    return defineStore({
        id,
        state: () => ({
          count: 1,
        }),
        actions: {
            increment(n?: number) {
                if (n) {
                    this.count += n;
                } else {
                    this.count++;
                }
            }
        },
        undo: options
    });
}

describe('PiniaUndo', () => {
    const app = createApp({})

    beforeEach(() => {
        const pinia = createPinia().use(PiniaUndo);
        app.use(pinia);
        setActivePinia(pinia);
        // 🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.
        jest.spyOn(console, 'error').mockImplementation(() => {});
        // [Vue warn]: App already provides property with key "Symbol(pinia)". It will be overwritten with the new value.
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('returns the first/last value if stack is in initial state', () => {
        const useCounterStore = factory('counter');

        const counter = useCounterStore();

        counter.undo();
        expect(counter.count).toBe(1);
        counter.redo();
        expect(counter.count).toBe(1);
    });

    it('goes back and forward through history state', () => {
        const useCounterStore = factory('counter2');

        const counter = useCounterStore();
        
        counter.increment();
        counter.increment();
        counter.increment();

        counter.undo();
        expect(counter.count).toEqual(3);
        counter.undo();
        expect(counter.count).toEqual(2);
        counter.undo();
        expect(counter.count).toEqual(1);
        counter.redo();
        expect(counter.count).toEqual(2);
        counter.redo();
        expect(counter.count).toEqual(3);
        counter.redo();
        expect(counter.count).toEqual(4);
    });

    it('clears later values', () => {
        const useCounterStore = factory('counter3');

        const counter = useCounterStore();

        counter.increment();
        counter.increment();

        counter.undo();
        expect(counter.count).toBe(2);
        counter.increment(2);

        counter.undo();
        expect(counter.count).toBe(2);
        counter.undo();
        expect(counter.count).toBe(1);


        counter.redo();
        expect(counter.count).toBe(2);
        counter.redo();
        expect(counter.count).toBe(4);
    });

    it('does not track history of property if omitted', () => {
        const useCounterStore = factory('counter4', {
            omit: ['count']
        });

        const counter = useCounterStore();

        counter.increment();
        counter.undo();
        expect(counter.count).toBe(2);

        counter.increment();
        counter.redo();
        expect(counter.count).toBe(3);
    });

    it('ignores store history if disabled', () => {
        const useCounterStore = factory('counter5', {
            disable: true
        });

        const counter = useCounterStore();

        expect(() => {
            counter.undo()
        }).toThrow(TypeError);
    });
});