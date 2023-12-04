import { createPinia, defineStore, setActivePinia } from 'pinia'
import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PiniaUndo } from '../src'

function factory(id: string, options?: { omit?: any[], disable?: boolean }) {
  return defineStore({
    id,
    state: () => ({
      count: 1,
    }),
    actions: {
      increment(n?: number) {
        if (n)
          this.count += n

        else
          this.count++
      },
    },
    undo: options,
  })
}

describe('piniaUndo', () => {
  const app = createApp({})

  beforeEach(() => {
    const pinia = createPinia().use(PiniaUndo)
    app.use(pinia)
    setActivePinia(pinia)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('returns the first/last value if stack is in initial state', () => {
    const useCounterStore = factory('counter')

    const counter = useCounterStore()

    counter.undo()
    expect(counter.count).toBe(1)
    counter.redo()
    expect(counter.count).toBe(1)
  })

  it('goes back and forward through history state', () => {
    const useCounterStore = factory('counter2')

    const counter = useCounterStore()

    counter.increment()
    counter.increment()
    counter.increment()

    counter.undo()

    expect(counter.count).toEqual(3)
    counter.undo()
    expect(counter.count).toEqual(2)
    counter.undo()
    expect(counter.count).toEqual(1)
    counter.redo()
    expect(counter.count).toEqual(2)
    counter.redo()
    expect(counter.count).toEqual(3)
    counter.redo()
    expect(counter.count).toEqual(4)
  })

  it('clears later values', () => {
    const useCounterStore = factory('counter3')

    const counter = useCounterStore()

    counter.increment()
    counter.increment()

    counter.undo()
    expect(counter.count).toBe(2)
    counter.increment(2)

    counter.undo()
    expect(counter.count).toBe(2)
    counter.undo()
    expect(counter.count).toBe(1)

    counter.redo()
    expect(counter.count).toBe(2)
    counter.redo()
    expect(counter.count).toBe(4)
  })

  it('does not track history of property if omitted', () => {
    const useCounterStore = factory('counter4', {
      omit: ['count'],
    })

    const counter = useCounterStore()

    counter.increment()
    counter.undo()
    expect(counter.count).toBe(2)

    counter.increment()
    counter.redo()
    expect(counter.count).toBe(3)
  })

  it('ignores store history if disabled', () => {
    const useCounterStore = factory('counter5', {
      disable: true,
    })

    const counter = useCounterStore()

    expect(() => {
      counter.undo()
    }).toThrow(TypeError)
  })
})
