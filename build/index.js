'use strict';

function isArray(target){
    return Array.isArray(target)
}

function isString(target){
    return typeof target ==='string'
}

const ShapeFlags={
    ELEMENT:1,
    TEXT:1<<1,
    FRAGMENT:1<<2,
    COMPONENT:1<<3,
    TEXT_CHILDREN:1<<4,
    ARRAY_CHILDREN:1<<5,
    CHILDREN:(1<<4) | (1<<5)
};
const Text=Symbol('Text');
const Fragment=Symbol('Fragment');
/**
 * 
 * @param {string | Object | Text | Fragment} type  'div' Component Text Fragment 
 * @param {Object | null} props 
 * @param {string | array | null} children 
 * @returns  VNode
 */
function h(type,props,children){
    let shapeFlag=0;
    if(isString(type)) shapeFlag=ShapeFlags.ELEMENT;
    else if(type ===Text) shapeFlag=ShapeFlags.TEXT;
    else if(type===Fragment) shapeFlag=ShapeFlags.FRAGMENT;
    else shapeFlag=ShapeFlags.COMPONENT;

    if(isString(children)) shapeFlag|=ShapeFlags.TEXT_CHILDREN;
    else if(isArray(children)) shapeFlag |=ShapeFlags.ARRAY_CHILDREN;
    return {
        type,
        props,
        children,
        shapeFlag,
        el:null,
        anchor:null
    }
}

const domPropsRE=/[A-Z]|^(value|checked|selected|muted|disabled)$/;


function patchProps(oldProps,newProps,el){
    oldProps=oldProps || {};
    newProps=newProps || {};
     if(oldProps===newProps) return
     for(const key in newProps){
         const next=newProps[key];
         const prev=oldProps[key];
       if(prev!==next)  patchDomProp(prev,next,key,el);
     }    
      for(const key in oldProps){
          if(newProps[key]==null){
              patchDomProp(oldProps[key],null,key,el);
          }
      }    
}

function patchDomProp(prev,next,key,el){
        switch (key) {
            case 'class':
                el.className=next || "";
                break;
            case 'style':
                if(prev){
                    //移除不存在于next上的styleName
                    for (const styleName in prev){
                       if(next[styleName]==null){
                           el.style[styleName]='';
                       }
                    }
                }
                for(const styleName in next){
                    el.style[styleName]=next[styleName];
                }    

                break;
            default:
                //事件 例如onClick
                if(/^on[A-Z]/.test(key)){
                   const eventName=key.slice(2).toLowerCase();
                   if(prev) el.removeEventListener(eventName,prev);
                   if(next) el.addEventListener(eventName,next);
                   //原生标准prop属性
                } else if(domPropsRE.test(key)){
                     //  只写属性默认true
                    if(next===''&&isBoolean(el[key])) next=true;
                    el[key]=next;
                } else {
                    //移除属性
                    if(next==null || next===false){
                        el.removeAttribute(key);
                    }else {
                        el.setAttribute(key,next);
                    }
                }
                break;
        }
}

function render(vnode,container){
   const prevVnode=container._vnode;
   if(!vnode){
       if(prevVnode){
           unmount(prevVnode);
       }
   }else {
       patch(prevVnode,vnode,container);
   }
   container._vnode=vnode;
}

function unmount(vnode){
    const {shapeFlag}=vnode;
    if(shapeFlag&ShapeFlags.COMPONENT) ;
    else if(shapeFlag&ShapeFlags.FRAGMENT) ;
    else {
        el.parentNode.removeChild(el);
    }
}

function patch(n1,n2,container,anchor){
    if(n1&&!isSameVnode(n1,n2)){
        unmount(n1);
        n1=null;
    }
   const {shapeFlag} =n2;
   if(shapeFlag&ShapeFlags.COMPONENT) ;
   else if(shapeFlag&ShapeFlags.TEXT) processText(n1,n2,container,anchor);
   else if(shapeFlag&ShapeFlags.FRAGMENT) processFragment(n1,n2,container,anchor);
   else if(shapeFlag&ShapeFlags.ELEMENT) processElement(n1,n2,container,anchor);
   
}

function isSameVnode(n1,n2){
    return n1.type===n2.type
}

function processText(n1,n2,container,anchor){
    if(n1){
       n2.el=n1.el;
       n1.el.textContent=n2.children;
    }else {
        mountTextNode(n2,container,anchor);
    }
}

function processFragment(n1,n2,container,anchor){
    const fragmentStartAnchor=(n2.el=n1?n1.el:document.createTextNode(''));
    const fragmentEndAnchor=(n2.el=n1?n1.anchor:document.createTextNode(''));
    if(n1){
       patchChildren(n1,n2,container,fragmentEndAnchor);
    }else {
        container.insertBefore(fragmentStartAnchor,anchor);
        container.insertBefore(fragmentEndAnchor,anchor);
        mountChildren(n2.children,container,fragmentEndAnchor);
    }
}

function processElement(n1,n2,container,anchor){
     if(n1){
        patchElement(n1,n2);   
     }else {
         mountElement(n2,container,anchor);
     }
}

function patchElement(n1,n2){
      n2.el=n1.el;
      patchProps(n1.props,n2.props,n2.el);
      patchChildren(n1,n2,n2.el);
}

function mountTextNode(vnode,container,anchor){
    const textNode=document.createTextNode(vnode.children);
        container.insertBefore(textNode,anchor);
        vnode.el=textNode;
}

function mountElement(vnode,container,anchor){
    const {type,props,shapeFlag,children}=vnode;
    const el=document.createElement(type);
    patchProps(null,props,el);
    if(shapeFlag&ShapeFlags.TEXT_CHILDREN){
        mountTextNode(vnode,el);
    }else if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){
        mountChildren(children,el);
    }
    container.insertBefore(el,anchor);
    vnode.el=el;
}
//只处理数组类型的children
function mountChildren(children,container,anchor){
           children.forEach(child=>{
            //递归挂载children
            patch(null,child,container,anchor);
        });
}

function patchChildren(n1,n2,container,anchor){
      const {shapeFlag:prevShapeFlag,children:c1} =n1;
      const {shapeFlag:shapeFlag,children:c2} =n2;
      if(shapeFlag&ShapeFlags.TEXT_CHILDREN){
        if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN) unmountChildren(c1);
        container.textContent=c2;
      }else if(shapeFlag&ShapeFlags.ARRAY_CHILDREN){
        if(prevShapeFlag&ShapeFlags.TEXT_CHILDREN){
              container.textContent='';
              mountChildren(c2,container,anchor);  
        }else if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN){
             patchArrayChildren(c1,c2,container,anchor);
        }else {
            mountChildren(c2,container,anchor);
        }
      }else {
        if(prevShapeFlag&ShapeFlags.TEXT_CHILDREN){
             container.textContent='';
        }else if(prevShapeFlag&ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1);
        }
      }
}

function unmountChildren(children){
   children.forEach(child=>unmount(child));
}

function patchArrayChildren(c1,c2,container,anchor){
  const oldLength=c1.length; 
  const newLength=c2.length; 
  const commonLength=Math.min(oldLength,newLength);
  for(let i=0;i<commonLength;++i){
      patch(c1[i],c2[i],container,anchor);
  }
  if(oldLength>newLength){
      unmountChildren(c1.slice(commonLength));
  }else if(oldLength<newLength){
      mountChildren(c2.slice(commonLength),container,anchor);
  }
}

render(
    h('ul',null,[
        h('li',null,'first'),
        h(Fragment,null,[]),
        h('li',null,'last'),
    ]),
    document.body
);

setTimeout(()=>{
    render(
        h('ul',null,[
            h('li',null,'first'),
            h(Fragment,null,[
                h('li',null,'middle')
            ]),
            h('li',null,'last'),
        ]),
        document.body
    );
},2000);
