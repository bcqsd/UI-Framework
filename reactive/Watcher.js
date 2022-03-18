import { parsePath } from "./utils"

export default class Watcher{
    constructor(vm,expOrFn,cb){
        //将dom节点绑定到实例属性上
        this.vm=vm
        this.getter=parsePath(expOrFn)
        this.cb=cb
        //获取响应式数据,并在读取响应式数据的同时把自己加到数据的Dep数组里,同时将旧数据缓存到value属性上
        this.value=this.get()
    }
    get(){
        //?每次读取数据会不会导致dep数组里有重复元素
        window.target=this
        //读取data的属性,触发getter收集位于window.target上的依赖
        let value=this.getter(this.vm) 
        window.target=undefined
        return value
    }
    update(){
        const oldValue=this.value
        this.value=this.get()
        this.cb.call(this.vm,this.value,oldValue)
    }
}
