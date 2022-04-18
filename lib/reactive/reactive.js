import { hasChanged, isObject } from "../utils/index.js";
import { track, trigger } from "./effect";
/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */

const proxyMap = new WeakMap();
export function reactive(target) {
  // 检查对同一个对象的代理 a=reactive(obj) b=reactiveobj a===b
  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  if (!isObject(target)) {
    console.warn('target is not an object');
    return target;
  } //检查重复代理 reactive(reactiveObj)=reactiveObj


  if (isReactive(target)) {
    return target;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key == '__isReactive') {
        return true;
      }

      const res = Reflect.get(target, key, receiver);
      track(target, key); //对象深层代理

      return isObject(res) ? reactive(res) : res;
    },

    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);

      if (key !== 'length' && !hasChanged(oldValue, value)) {
        return true;
      }

      const res = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return res;
    }

  });
  proxyMap.set(target, proxy);
  return proxy;
} //特殊代理key并不真实存在

export function isReactive(target) {
  return target.__isReactive;
}