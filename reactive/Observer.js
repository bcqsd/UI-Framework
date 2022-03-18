import Dep from './Dep'
export class Observer{
    constructor(value){
        this.value=value
        if(!Array.isArray(value)){
            this.walk(value)
        }
    }
    walk(obj){
        Object.keys(obj).forEach(p=>defineReactive(obj,p,obj[p]))
    }
}
function defineReactive(data,key,val){
    if(typeof val === 'object'){
        new Observer(val)
    }
    let dep=new Dep()
    Object.defineProperty(data,key,{
        enumerable:true,
        configurable:true,
        get:function(){
            dep.addSub()
            return val
        },
        set:function(newVal){
            dep.notify()
            val=newVal
        }
    })
}