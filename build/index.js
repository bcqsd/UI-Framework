'use strict';

function isArray(target){
    return Array.isArray(target)
}

function isString(target){
    return typeof target ==='string'
}
function isBoolean(target){
    return typeof target ==='boolean'
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
        shapeFlag
    }
}

function render(vnode,container){
    mount(vnode,container);
}

function mount(vnode,container){
    const {shapeFlag}=vnode;
    if(shapeFlag & ShapeFlags.ELEMENT) mountElement(vnode,container);
    else if(shapeFlag & ShapeFlags.TEXT) mountText(vnode,container);
    else if(shapeFlag & ShapeFlags.FRAGMENT) mountFragment(vnode,container);
    else ;
}

function mountElement(vnode,container){
   const {type,props}=vnode;
   const el=document.createElement(type);
   mountProps(props,el);
   mountChildren(vnode,el);
   container.appendChild(el);
}
function mountText(vnode,container){
   const textNode=document.createTextNode(vnode.children);
   container.appendChild(textNode);
}
function mountFragment(vnode,container){
   mountChildren(vnode,container);
}

const domPropsRE=/[A-Z]|^(value|checked|selected|muted|disabled)$/;
function mountProps(props,el){
    for(const key in props){
        const value=props[key];
        switch (key) {
            case 'class':
                el.className=value;
                break;
            case 'style':
                for(const styleName in value){
                    el.style[styleName]=value[styleName];
                }        
                break;
            default:
                //事件 例如onClick
                if(/^on[A-Z]/.test(key)){
                   const eventName=key.slice(2).toLowerCase();
                   el.addEventListener(eventName,value);
                   //原生标准prop属性
                } else if(domPropsRE.test(key)){
                     //  只写属性默认true
                    if(value===''&&isBoolean(el[key])) value=true;
                    el[key]=value;
                } else {
                    //移除属性
                    if(value==null || value===false){
                        el.removeAttribute(key);
                    }else {
                        el.setAttribute(key,value);
                    }
                }
                break;
        }
    }
}
function mountChildren(vnode,container){
    const {shapeFlag}=vnode;
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) mountText(vnode,container);
    else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        vnode.children.forEach(child=>{
            //递归挂载children
            mount(child,container);
        });
    }
}

const vnode=h(
  'div',{
      class: 'a b',
      style:{
          border:'1px solid',
          fontSize:'14px',
      },
      onClick:()=>console.log('click'),
      id:'foo',
      checked:'',
      custom:false,
  },
  [
      h('ul',null,[
          h('li',{style:{color:'red'}},'1'),
          h('li',null,'2'),
          h('li',{style:{color:'blue'}},'1'),
          h(Fragment,null,[h('li',null,'4'),h('li')]),
          h('li',null,[h(Text,null,'hello world')]),
      ])
  ]
);
render(vnode,document.body);
