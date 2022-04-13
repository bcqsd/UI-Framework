
let effectStack=[]

export function effect(fn,options){
   const effectFn= ()=>{
       try{
         effectStack.push(effectFn)
         return fn()
       }
       finally{
          effectStack.pop()
       }
   }
   options=options || {}
   //初始化执行，收集依赖
  if(!options.lazy)  effectFn()
  if(options.scheduler) effectFn.scheduler=options.scheduler
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
    if(!effectStack.length) {
      //说明get操作并不是尚未被监视的activeFn引起，而是set操作导致的重新get
        return
    }
    let depsMap=targetMap.get(target)
    if(!depsMap) targetMap.set(target,(depsMap=new Map()))
    let deps=depsMap.get(key)
    if(!deps) depsMap.set(key,(deps=new Set()))
    deps.add(effectStack[effectStack.length-1])
}
export function trigger(target,key){
   const depsMap=targetMap.get(target)
   if(!depsMap) {
     //说明当前target还没有被副作用函数或computed函数依赖
      return 
   }
   const deps=depsMap.get(key)
   if(!deps) {
    //  console.warn(`${key} has not been tracked`) 
    return
   }
   deps.forEach(effectFn=>{
      if(effectFn.scheduler) {
        effectFn.scheduler(effectFn)
      }else{
        effectFn()
      }
   })
}