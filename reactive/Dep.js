let uid=0
export default class Dep{
   constructor(){
       //每个依赖列表的唯一标识
       this.id=uid++
       //依赖数组
       this.subs=[]
   }
   addSub(){
       //让位于window.target上的watcher对象自己加到数组里来
      window.target&&window.target.addDep(this)
   }
   removeSub(sub){
        const index=this.subs.indexOf(sub)
        index!=-1&&this.subs.splice(index,1)    
   }
   notify(){
       this.subs.forEach(p=>p.update())
   }
}