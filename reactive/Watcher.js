import { parsePath } from "./utils"
/**
 * expOrFn  (obj)=>obj.b.c or  b.c
 */
export default class Watcher{
    constructor(vm,expOrFn,cb){
        //将dom节点绑定到实例属性上
        this.vm=vm
        if(typeof expOrFn ==='function'){
              this.getter=expOrFn
        }
        else{
            this.getter=parsePath(expOrFn)
        }
        this.cb=cb
        //获取响应式数据,并在读取响应式数据的同时把自己加到数据的Dep数组里,同时将旧数据缓存到value属性上
        this.value=this.get()
        //watcher与dep是多对多的关系，当expOfFn是函数时，一个watcher就要收集多个Dep
        this.deps=[]
        this.depIds=new Set()
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
    //判断是否已订阅dep，如果没有，订阅并加到已订阅列表
    addDep(dep){
        const id=dep.id
        if(!this.depIds.has(id)){
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }
}
