let activeEffect;

export function effect(fn){
   const effectFn= ()=>{
       try{
         activeEffect=effectFn;  
         return fn()
       }
       finally{
          activeEffect=undefined;
       }
   }
   //初始化执行，收集依赖
   effectFn()
   return effectFn
}
/**
 * {
 *   reactiveTarget:{
 *         key: Set(depsFn)    
 *      }  
 * }
 */
const targetMap=new WeakMap()

export function track(target,key){
    if(!activeEffect) {
        console.warn('not get from a effectFn')
        return
    }
    let depsMap=targetMap.get(target)
    if(!depsMap) targetMap.set(target,(depsMap=new Map()))
    let deps=depsMap.get(key)
    if(!deps) depsMap.set(key,(deps=new Set()))
    deps.add(activeEffect)
}
export function trigger(target,key){
   const depsMap=targetMap.get(target)
   if(!depsMap) return
   const deps=depsMap.get(key)
   if(!deps) return
   deps.forEach(effectFn=>{
       effectFn()
   })
}