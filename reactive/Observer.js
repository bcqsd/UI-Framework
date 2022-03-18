import Dep from './Dep.js'
import { arrayMethods,def } from './utils.js'
/**
 * 传入一个对象，监听对象上的所有属性
 */
export class Observer{
    constructor(value){
        this.value=value
        this.dep=new Dep()
        def(value,'__ob__',this)
        if(Array.isArray(value)){
            Object.setPrototypeOf(value,arrayMethods)
        }else{
           this.walk(value) 
        }
    }
    //递归遍历所有属性直到obj不是对象
    walk(obj){
        Object.keys(obj).forEach(p=>defineReactive(obj,p,obj[p]))
    }
    observeArray(items){
        items.forEach(item=>observe(item))
    }
}

/**
 *  传入一个对象及其属性，监听这个属性
 */
function defineReactive(data,key,val){
    //获取value对应的Observer实例
    let childOb=observe(val)
    let dep=new Dep()
    Object.defineProperty(data,key,{
        enumerable:true,
        configurable:true,
        get:function(){
            dep.addSub()
            if(childOb){
                childOb.dep.addSub()
            }
            return val
        },
        set:function(newVal){
            dep.notify()
            val=newVal
        }
    })
}
/**
 * 对Observer类功能的函数式包装
 */
export function observe(value,asRootData){
    let ob=null
    if(Object.hasOwnProperty(value,'__ob__')&&value.__ob__ instanceof Observer) {
        ob=value.__ob__
    }else{
        ob=new Observer(value)
    }
    return ob
}

const arrayProto=Array.prototype
//array的拦截器
export const arrayMethods=Object.create(arrayProto);
['push','pop','shift','unshift','splice','sort','reverse'].forEach(method=>{
    const original=arrayProto[method]
    def(arrayMethods,method,function mutator(...args){
        const result=original.apply(this,args)
        const ob=this.__ob__
        //监听新增元素
        let inserted
        switch (method) {
            case 'push':
                inserted=args
                break;
            case 'unshift':
                inserted=args
                break;
            case 'splice':
                inserted=args.slice(2)
                break;
        }
        if(inserted) ob.obverseArray(inserted)
        ob.dep.notify()
        return result
    })
})