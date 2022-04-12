import {reactive} from '../reactive/reactive'
import {normlizeVNode} from './vnode'
import {patch} from './render'
function initProps(instance,vnode){
    const {type:Component,props:vnodeProps}=vnode
    const props=instance.props={}
    const attrs=instance.attrs={}
    //将vnode上的属性挂载到instance上的props或attrs上
    for(const key in vnodeProps){
        if(Component.props?.includes(key)){
            props[key]=vnodeProps[key]
        }else{
            attrs[key]=vnodeProps[key]
        }
    }
    instance.props=reactive(instance.props)
}


export function mountComponent(vnode,container,anchor){
   const {type:Component}=vnode
   const instance={
       props:null,
       attrs:null,
       setupState:null,
       ctx:null,
       mount:null
   }
   initProps(instance,vnode)
   instance.setupState=Component.setup?.(instance.props,{attrs:instance.attrs})
   instance.ctx={
       ...instance.props,
       ...instance.setupState
   }
   instance.mount=()=>{
      const subTree= normlizeVNode(
        Component.render(instance.ctx)
       )
      patch(null,subTree,container,anchor)
   }
   instance.mount()
}

