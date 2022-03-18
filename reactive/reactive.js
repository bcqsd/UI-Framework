import Dep from './Dep'
function defineReactive(data,key,val){
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