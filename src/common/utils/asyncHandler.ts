/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error Express internal module, no type declarations
import Layer from 'express/lib/router/layer'
// @ts-expect-error Express internal module, no type declarations
import Router from 'express/lib/router'

type AnyFunction = (...args: any[]) => any

const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1]
const noop: AnyFunction = () => {}

function copyFnProps(oldFn: AnyFunction, newFn: AnyFunction): AnyFunction {
  Object.keys(oldFn).forEach((key) => {
    ;(newFn as any)[key] = (oldFn as any)[key]
  })
  return newFn
}

function wrap(fn: AnyFunction): AnyFunction {
  const wrapped = function wrapped(this: any, ...args: any[]) {
    const ret = fn.apply(this, args)
    const next: AnyFunction = (args.length === 5 ? args[2] : last(args)) || noop
    if (ret && typeof ret.catch === 'function') {
      ret.catch((err: any) => next(err))
    }
    return ret
  }

  Object.defineProperty(wrapped, 'length', {
    value: fn.length,
    writable: false
  })

  return copyFnProps(fn, wrapped)
}

function patchRouterParam(): void {
  const originalParam = Router.prototype.constructor.param
  Router.prototype.constructor.param = function param(name: string, fn: AnyFunction) {
    fn = wrap(fn)
    return originalParam.call(this, name, fn)
  }
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get() {
    return this.__handle
  },
  set(fn: AnyFunction) {
    fn = wrap(fn)
    this.__handle = fn
  }
})

patchRouterParam()
