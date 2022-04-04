import { isBoolean } from "../utils/index"
import { ShapeFlags } from "./vnode"

export function render(vnode,container){
    mount(vnode,container)
}

function mount(vnode,container){
    const {shapeFlag}=vnode
    if(shapeFlag & ShapeFlags.ELEMENT) mountElement(vnode,container)
    else if(shapeFlag & ShapeFlags.TEXT) mountText(vnode,container)
    else if(shapeFlag & ShapeFlags.FRAGMENT) mountFragment(vnode,container)
    else if(shapeFlag & ShapeFlags.COMPONENT) mountComponent(vnode,container)
}

function mountElement(vnode,container){
   const {type,props}=vnode
   const el=document.createElement(type)
   mountProps(props,el)
   mountChildren(vnode,el)
   container.appendChild(el)
}
function mountText(vnode,container){
   const textNode=document.createTextNode(vnode.children)
   container.appendChild(textNode)
}
function mountFragment(vnode,container){
   mountChildren(vnode,container)
}
function mountComponent(vnode,container){
    
}

const domPropsRE=/[A-Z]|^(value|checked|selected|muted|disabled)$/
function mountProps(props,el){
    for(const key in props){
        const value=props[key]
        switch (key) {
            case 'class':
                el.className=value
                break;
            case 'style':
                for(const styleName in value){
                    el.style[styleName]=value[styleName]
                }        
                break;
            default:
                //事件 例如onClick
                if(/^on[A-Z]/.test(key)){
                   const eventName=key.slice(2).toLowerCase()
                   el.addEventListener(eventName,value)
                   //原生标准prop属性
                } else if(domPropsRE.test(key)){
                     //  只写属性默认true
                    if(value===''&&isBoolean(el[key])) value=true
                    el[key]=value
                } else {
                    //移除属性
                    if(value==null || value===false){
                        el.removeAttribute(key)
                    }else{
                        el.setAttribute(key,value)
                    }
                }
                break;
        }
    }
}
function mountChildren(vnode,container){
    const {shapeFlag}=vnode
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) mountText(vnode,container)
    else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        vnode.children.forEach(child=>{
            //递归挂载children
            mount(child,container)
        })
    }
}