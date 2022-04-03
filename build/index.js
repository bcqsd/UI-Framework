'use strict';

let activeEffect;

function effect(fn){
   const effectFn= ()=>{
       try{
         activeEffect=effectFn;  
         return fn()
       }
       finally{
          activeEffect=undefined;
       }
   };
   //初始化执行，收集依赖
   effectFn();
   return effectFn
}
/**
 * {
 *   reactiveTarget:{
 *         key: Set(depsFn)    
 *      }  
 * }
 */
const targetMap=new WeakMap();

function track(target,key){
    if(!activeEffect) {
        console.warn('not get from a effectFn');
        return
    }
    let depsMap=targetMap.get(target);
    if(!depsMap) targetMap.set(target,(depsMap=new Map()));
    let deps=depsMap.get(key);
    if(!deps) depsMap.set(key,(deps=new Set()));
    deps.add(activeEffect);
}
function trigger(target,key){
   const depsMap=targetMap.get(target);
   if(!depsMap) return
   const deps=depsMap.get(key);
   if(!deps) return
   deps.forEach(effectFn=>{
       effectFn();
   });
}

/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */
function reactive(target){
    const proxy=new Proxy(target,{
        get(target,key){
           const res=Reflect.get(target,key);
           track(target,key);
           return res
        },
        set(target,key,value){
           const oldValue=Reflect.get(target,key);
           if(oldValue===value){
               return 
           }
           const res=Reflect.set(target,key,value);
           trigger(target,key);
           return res
        }
    });
    return proxy
}

window.t=reactive({
    value:1
});
effect(()=>{
    console.log('t.value is: '+t.value);
});
