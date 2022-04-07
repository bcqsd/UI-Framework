import { ShapeFlags } from "./vnode"
import { patchProps } from "./patchProps"

export function render(vnode,container){
   const prevVnode=container._vnode
   if(!vnode){
       if(prevVnode){
           unmount(prevVnode)
       }
   }else{
       patch(prevVnode,vnode,container)
   }
   container._vnode=vnode
}

function unmount(vnode){
    const {shapeFlag}=vnode
    if(shapeFlag&ShapeFlags.COMPONENT) unmountComponent(vnode)
    else if(shapeFlag&ShapeFlags.FRAGMENT) unmountFragment(vnode)
    else {
        el.parentNode.removeChild(el)
    }
}
function unmountComponent(vnode){

}

function processComponent(n1,n2,container){

}

function unmountFragment(vnode){

}

function patch(n1,n2,container){
    if(n1&&!isSameVnode(n1,n2)){
        unmount(n1)
        n1=null
    }
   const {shapeFlag} =n2;
   if(shapeFlag&ShapeFlags.COMPONENT) processComponent(n1,n2,container)
   else if(shapeFlag&ShapeFlags.TEXT) processText(n1,n2,container)
   else if(shapeFlag&ShapeFlags.FRAGMENT) processFragment(n1,n2,container)
   else if(shapeFlag&ShapeFlags.ELEMENT) processElement(n1,n2,container)
   
}

function isSameVnode(n1,n2){
    return n1.type===n2.type
}

function processText(n1,n2,container){
    if(n1){
       n2.el=n1.el
       n1.el.textContent=n2.children
    }else{
        mountTextNode(n2,container)
    }
}

function processFragment(n1,n2,container){
    if(n1){
       patchChildren(n1,n2,container)
    }else{
        mountChildren(n2.children,container)
    }
}

function processElement(n1,n2,container){
     if(n1){
        patchElement(n1,n2,container)   
     }else{
         mountElement(n2,container)
     }
}

function patchElement(n1,n2){
      n2.el=n1.el
      patchProps(n1.props,n2.props,n2.el)
      patchChildren(n1,n2,n2.el)
}

function mountTextNode(vnode,container){
    const textNode=document.createTextNode(vnode.children)
        container.appendChild(textNode)
        vnode.el=textNode
}

function mountElement(vnode,container){
    const {type,props,shapeFlag,children}=vnode
    const el=document.createElement(type)
    patchProps(null,props,el)
    if(shapeFlag&ShapeFlags.TEXT_CHILDREN){
        mountTextNode(vnode,el)
    }else if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){
        mountChildren(children,el)
    }
    mountChildren(vnode,el)
    container.appendChild(el)
    vnode.el=el
}
//只处理数组类型的children
function mountChildren(children,container){
           children.forEach(child=>{
            //递归挂载children
            patch(null,child,container)
        })
}

function patchChildren(n1,n2,container){
      const {shapeFlag:prevShapeFlag,children:c1} =n1
      const {shapeFlag:shapeFlag,children:c2} =n2
      if(shapeFlag&ShapeFlags.TEXT_CHILDREN){
        if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN) unmountChildren(c1)
        container.textContent=c2
      }else if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){
        if(prevShapeFlag&ShapeFlags.TEXT_CHILDREN){
              container.textContent=''
              mountChildren(c2,container)  
        }else if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN){
             patchArrayChildren(c1,c2,container)
        }else{
            mountChildren(c2,container)
        }
      }else{
        if(prevShapeFlag&ShapeFlags.TEXT_CHILDREN){
             container.textContent=''
        }else if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1)
        }
      }
}

function unmountChildren(children){
   children.forEach(child=>unmount(child))
}

function patchArrayChildren(c1,c2,container){
  const oldLength=c1.length 
  const newLength=c2.length 
  const commonLength=Math.min(oldLength,newLength)
  for(let i=0;i<commonLength;++i){
      patch(c1[i],c2[i],container)
  }
  if(oldLength>newLength){
      unmountChildren(c1.slice(commonLength))
  }else if(oldLength<newLength){
      mountChildren(c2.slice(commonLength),container)
  }
}