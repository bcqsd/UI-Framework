import { tracker, trigger } from "./effect"

/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */
export function reactive(target){
    const proxy=new Proxy(target,{
        set(target,key){
            
           tracker(target,key)
           return Reflect.get(target,key)
        },
        get(target,key,value){

           const res=Reflect.set(target,key,value)
           trigger(target,key)
           return res
        }
    })
}