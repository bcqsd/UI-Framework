
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
      //说明get操作并不是尚未被监视的activeFn引起，而是set操作导致的重新get
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
   if(!depsMap) {
      console.warn(`${target} has not been reactive`)
      return 
   }
   const deps=depsMap.get(key)
   if(!deps) {
    //  console.warn(`${key} has not been tracked`) 
    return
   }
   deps.forEach(effectFn=>{
       effectFn()
   })
}