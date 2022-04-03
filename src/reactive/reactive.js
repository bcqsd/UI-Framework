import { track, trigger } from "./effect"

/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */
export function reactive(target){
    const proxy=new Proxy(target,{
        get(target,key){
           const res=Reflect.get(target,key)
           track(target,key)
           return res
        },
        set(target,key,value){
           const oldValue=Reflect.get(target,key)
           if(oldValue===value){
               return 
           }
           const res=Reflect.set(target,key,value)
           trigger(target,key)
           return res
        }
    })
    return proxy
}