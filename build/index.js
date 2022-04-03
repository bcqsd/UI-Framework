'use strict';

let effectStack=[];

function effect(fn){
   const effectFn= ()=>{
       try{
         effectStack.push(effectFn);
         return fn()
       }
       finally{
          effectStack.pop();
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
    if(!effectStack.length) {
      //说明get操作并不是尚未被监视的activeFn引起，而是set操作导致的重新get
        return
    }
    let depsMap=targetMap.get(target);
    if(!depsMap) targetMap.set(target,(depsMap=new Map()));
    let deps=depsMap.get(key);
    if(!deps) depsMap.set(key,(deps=new Set()));
    deps.add(effectStack[effectStack.length-1]);
}
function trigger(target,key){
   const depsMap=targetMap.get(target);
   if(!depsMap) {
      console.warn(`${target} has not been reactive`);
      return 
   }
   const deps=depsMap.get(key);
   if(!deps) {
    //  console.warn(`${key} has not been tracked`) 
    return
   }
   deps.forEach(effectFn=>{
       effectFn();
   });
}

function isObject(target){
    return typeof target==='object' &&target!==null
}
function hasChanged(oldValue,value){
    return oldValue!==value && !(Number.isNaN(oldValue)&&Number.isNaN(value))
}

/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */
const proxyMap=new WeakMap();

function reactive(target){
    // 检查对同一个对象的代理 a=reactive(obj) b=reactiveobj a===b
    if(proxyMap.has(target)) {
        return proxyMap.get(target)
    }
    if(!isObject(target)) {
        console.warn('target is not an object');
        return target
    }
    //检查重复代理 reactive(reactiveObj)=reactiveObj
    if(isReactive(target)) {
        return target
    }
    const proxy=new Proxy(target,{
        get(target,key,receiver){
            if(key=='__isReactive'){
                return true
            }
           const res=Reflect.get(target,key,receiver);
           track(target,key);
           //对象深层代理
           return isObject(res)?reactive(res):res
        },
        set(target,key,value,receiver){
           const oldValue=Reflect.get(target,key,receiver);
           if(key!=='length'&&!hasChanged(oldValue,value)){
               return true
           }         
           const res=Reflect.set(target,key,value,receiver);
           trigger(target,key);
           return res
        }
    });
    proxyMap.set(target,proxy);
    return proxy
}
//特殊代理key并不真实存在
function isReactive(target){
     return target.__isReactive
}

window.t=reactive({
    value:[1]
});
effect(()=>{
    console.log('t.value is: '+t.value);
});
