import { parsePath } from "./utils"

export default class Watcher{
    constructor(vm,expOrFn,cb){
        //将dom节点绑定到实例属性上
        this.vm=vm
        this.getter=parsePath(expOrFn)
        this.cb=cb
        //获取的响应式数据
        this.value=this.get()
    }
    get(){
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
