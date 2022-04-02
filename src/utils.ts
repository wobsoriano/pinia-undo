const makeCircularReplacer = () => {
  const seen = new WeakSet()

  return (_key: any, value: unknown) => {
    if (value !== null && typeof value === 'object') {
      if (seen.has(value))
        return '[Circular]'

      seen.add(value)
    }

    return value
  }
}

export interface Options {
  readonly indentation?: string | number
}

export function safeParse(object: unknown, { indentation }: Options = {}) {
  if (Array.isArray(object))
    object = object.map(element => JSON.parse(JSON.stringify(element, makeCircularReplacer())))

  return JSON.parse(JSON.stringify(object, makeCircularReplacer(), indentation))
}
