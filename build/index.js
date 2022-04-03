'use strict';

let effectStack=[];

function effect(fn,options){
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
  if(!options.lazy)  effectFn();
  if(options.scheduler) effectFn.scheduler=options.scheduler;
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
     //说明当前target还没有被副作用函数或computed函数依赖
      return 
   }
   const deps=depsMap.get(key);
   if(!deps) {
    //  console.warn(`${key} has not been tracked`) 
    return
   }
   deps.forEach(effectFn=>{
      if(effectFn.scheduler) {
        effectFn.scheduler();
      }else {
        effectFn();
      }
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

function ref(value){
   return reactive({value:value})
}

function computed(getter){
    return new computedImpl(getter)
}
class computedImpl{
    constructor(getter){
        this.__dirty=true;
        this.__value=undefined;
        this.__effect=effect(getter,{
            lazy:true,
            scheduler:()=>{
                this.__dirty=true;
                //依赖改变后虽然不会执行effectFn,但是要通知targetMap里的所有effect函数更新
                trigger(this,'value');
            }
        });
    }
    get value(){
        //如果依赖改变，执行computed函数重新计算。所以computed函数应该是纯函数而非副作用函数
          if(this.__dirty){
            this.__value=this.__effect();
            this.__dirty=false;
            //computed自己也是响应式的，其他effect函数get computed函数的时候会引发track
            track(this,'value');
          }
          return this.__value
    }
}

const num=ref(0);
(window.c=computed(()=>{
    console.log(`calculate c.value`);
    return num.value*2
}));
