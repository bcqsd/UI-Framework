export default class Dep{
   constructor(){
       //依赖数组
       this.subs=[]
   }
   addSub(){
      window.target&&this.subs.push(window.target)
   }
   removeSub(sub){
        const index=this.subs.indexOf(sub)
        index!=-1&&this.subs.splice(index,1)    
   }
   notify(){
       this.subs.forEach(p=>p.update())
   }
}