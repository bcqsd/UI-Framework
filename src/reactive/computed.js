import { effect, track, trigger } from "./effect"

export function computed(getter){
    return new computedImpl(getter)
}
class computedImpl{
    constructor(getter){
        this.__dirty=true
        this.__value=undefined
        this.__effect=effect(getter,{
            lazy:true,
            scheduler:()=>{
                this.__dirty=true
                //依赖改变后虽然不会执行effectFn,但是要通知targetMap里的所有effect函数更新
                trigger(this,'value')
            }
        })
    }
    get value(){
        //如果依赖改变，执行computed函数重新计算。所以computed函数应该是纯函数而非副作用函数
          if(this.__dirty){
            this.__value=this.__effect()
            this.__dirty=false
            //computed自己也是响应式的，其他effect函数get computed函数的时候会引发track
            track(this,'value')
          }
          return this.__value
    }
}