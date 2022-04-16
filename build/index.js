'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const NodeTypes={
    ROOT:'ROOT',
    ELEMENT:'ELEMENT',
    TEXT:"TEXT",
    SIMPLE_EXPRESSION:"SIMPLE_EXPRESSION",
    INTERPOLATION:'INTERPOLATION',
    ATTRIBUTE:"ATTRIBUTE",
};
const ELementTypes={
    ELEMENT:'ELEMENT',
    COMPONENT:'COMPONENT'
};

function createRoot(children){
    return {
        type:NodeTypes.ROOT,
        children
    }
}

//根据ast树生成code
function generate(ast) {
    const ret=traverseNode(ast);
    return `return ${ret}`
}

function traverseNode(node) {
    switch (node.type) {
        case NodeTypes.ROOT:
           if(node.children.length==1){
               return traverseNode(node.children[0])
           }     
           const result=traverseChildren(node);
           return result;
        case NodeTypes.TEXT:
          return createTextVNode(node)
        case NodeTypes.INTERPOLATION:
            //表达式节点的content是一个有isStatic标记的text节点
          return createTextVNode(node.content)
        case NodeTypes.ELEMENT:
       return  createElementVnode(node)
    }
}

function createTextVNode(node){
    const child=createText(node);
    return `h(Text,null,${child})`
}

function createText({isStatic=true,content=''}={}){
    return isStatic?JSON.stringify(content):content
}

function createElementVnode(node){
    const {children} =node;
    const tag=JSON.stringify(node.tag);
    const propArr=createPropArr(node);

    const propStr=propArr.length?`{ ${propArr.join(',')}}`:'null';
    if(!children.length){
       if(propStr==='null'){
            return `h(${tag})`
       }
       return  `h(${tag}),${propStr}`
    }
    let childrenStr=traverseChildren(node);
    return `h(${tag},${propStr},${childrenStr})`
}

function traverseChildren(node){
   const {children} =node;
   if(children.length===1){
       const child=children[0];
       if(child.type===NodeTypes.TEXT){
           return createText(child)
       }
       if(child.type===NodeTypes.INTERPOLATION){
           return createText(child.content)
       }

   }
   const results=[];
   for(let i=0;i<children.length;++i){
       const child=children[i];
       const result=traverseNode(child);
       results.push(result);
   }

   return `[${results.join(',')}]`
}

function createPropArr(node){
  const {props}=node;
  return [
      ... props.map(prop=>`${prop.name}:${createText(prop.value)}`),
       //todo 
     ]
}

function parse(content) {
  const context = createParserContext(content);
  const children = parseChildren(context);
  return createRoot(children)
}

function createParserContext(content) {
  return {
    source: content,
    options: {
      delimiters: ['{', '}']
    },
  }
}

function parseChildren(context) {
  const nodes = [];
  while (!isEnd(context)) {
    const s = context.source;
    let node;
    if (s.startsWith(context.options.delimiters[0])) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      node = parseElement(context);
    } else {
      node = parseText(context);
    }
    nodes.push(node);
  }
  let removedWhitedspaces = false;
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    if (node.type === NodeTypes.TEXT) {
      if (/[^\t\r\f\n ]/.test(node.content)) {
        node.content = node.content.replace(/[\t\r\f\n ]+/g, ' ');
      } else {
        const prev = nodes[i - 1];
        const next = nodes[i + 1];
        if (!prev || !next ||
          (prev.type == NodeTypes.ELEMENT && next.type === NodeTypes.ELEMENT
            && /[\r\n]/.test(node.content))
        ) {
          //删除空白节点
          nodes[i] = null;
          removedWhitedspaces = true;
        } else {
          node.content = ' ';
        }
      }
    }
  }
  return removedWhitedspaces ? nodes : nodes.filter(Boolean)
}
//缺点：不能解析a<b
function parseText(context) {
  let endIndex = context.source.length;
  const endTokens = ['<', context.options.delimiters[0]];
  //更新endIndex为最小的解析结束标志
  for (let i = 0; i < endTokens.length; ++i) {
    let index = context.source.indexOf(endTokens[i]);
    if (index != -1 && index < endIndex) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content
  }
}
// 传入r,解析[l,r)
function parseTextData(context, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content
}

function parseInterpolation(context) {
  const [open, close] = context.options.delimiters;
  advanceBy(context, open.length);
  const closeIndex = context.source.indexOf(close);
  const content = parseTextData(context, closeIndex).trim();
  advanceBy(context,close.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      isStatic: false
    }
  }
}

function parseElement(context) {
  const element = parseTag(context);
  if (element.isSelfClosing) {
    return element
  }
  element.children = parseChildren(context);
  parseTag(context);
  return element
}

function parseTag(context) {
  const match = /^<\/?([a-z]+)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceSpaces(context);
  const props = parseAttributes(context);
  const isSelfClosing = context.source.startsWith('/>');
  advanceBy(context, isSelfClosing ? 2 : 1);
  const tagType = isComponent(tag) ? ELementTypes.COMPONENT : ELementTypes.ELEMENT;
  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props,
    isSelfClosing,
    children: []
  }
}

function isComponent(tag) {
  //首字母大写是组件
  const reg = /^[A-Z]+/;
  return reg.exec(tag)
}
//解析属性
function parseAttributes(context) {
  const props = [];
  while (context.source.length && !context.source.startsWith('>')) {
    let attr = parseAttribute(context);
    props.push(attr);
  }
  return props
}
//解析属性名
function parseAttribute(context) {
  const match = /^[^\t\r\n\f ][^\t\r\n\f />=]*/.exec(context.source);
  const name = match[0];
  advanceBy(context, name.length);
  advanceSpaces(context);
  let value;
  if (context.source[0] === '=') {
    advanceBy(context, 1);
    advanceSpaces(context);
    value = parseAttributeValue(context);
  }
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value
    }
  }
}
//解析属性值
function parseAttributeValue(context) {
  advanceBy(context, 1);
  let endIndex = context.source.length;
  const endTokens = ['"',"'", '`',context.options.delimiters[1]];
  //更新endIndex为最小的解析结束标志
  for (let i = 0; i < endTokens.length; ++i) {
    let index = context.source.indexOf(endTokens[i]);
    if (index != -1 && index < endIndex) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  advanceBy(context, 1);
  advanceSpaces(context);
  return content
}

function isEnd(context) {
  const s = context.source;
  return !s || s.startsWith('</')
}
//给定一个下标，跳转到下标位置
function advanceBy(context, numberOfCharacters) {
  context.source = context.source.slice(numberOfCharacters);

}

function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

function compile(template){
    const ast=parse(template);
    const code=generate(ast);
    return code
}

function isObject(target){
    return typeof target==='object' &&target!==null
}

function isArray(target){
    return Array.isArray(target)
}
function hasChanged(oldValue,value){
    return oldValue!==value && !(Number.isNaN(oldValue)&&Number.isNaN(value))
}

function isString(target){
    return typeof target ==='string'
}
function isNumber(target){
    return typeof target ==='number'
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
 * @param {string | array | number | null} children 
 * @returns  VNode
 */
function h(type,props,children){
    let shapeFlag=0;
    if(isString(type)) shapeFlag=ShapeFlags.ELEMENT;
    else if(type ===Text) shapeFlag=ShapeFlags.TEXT;
    else if(type===Fragment) shapeFlag=ShapeFlags.FRAGMENT;
    else shapeFlag=ShapeFlags.COMPONENT;
     if(isNumber(children))  children=children.toString();
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

function normalizeVNode(result) {
    if (isArray(result)) {
      return h(Fragment, null, result);
    }
    if (isObject(result)) {
      return result;
    }
    // string, number
    return h(Text, null, result.toString());
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

let effectStack=[];

function effect(fn,options){
   const effectFn= ()=>{
       try{
         effectStack.push(effectFn);
         return fn()
       }
       finally{
          effectStack.pop();
       }
   };
   options=options || {};
   //初始化执行，收集依赖
  if(!options.lazy)  effectFn();
  if(options.scheduler) effectFn.scheduler=options.scheduler;
   return effectFn
}
/**
 * {
 *   reactiveTarget:{
 *         key: Set(depsFn)    
 *      }  
 * }
 */
const targetMap=new WeakMap();

function track(target,key){
    if(!effectStack.length) {
      //说明get操作并不是尚未被监视的activeFn引起，而是set操作导致的重新get
        return
    }
    let depsMap=targetMap.get(target);
    if(!depsMap) targetMap.set(target,(depsMap=new Map()));
    let deps=depsMap.get(key);
    if(!deps) depsMap.set(key,(deps=new Set()));
    deps.add(effectStack[effectStack.length-1]);
}
function trigger(target,key){
   const depsMap=targetMap.get(target);
   if(!depsMap) {
     //说明当前target还没有被副作用函数或computed函数依赖
      return 
   }
   const deps=depsMap.get(key);
   if(!deps) {
    //  console.warn(`${key} has not been tracked`) 
    return
   }
   deps.forEach(effectFn=>{
      if(effectFn.scheduler) {
        effectFn.scheduler(effectFn);
      }else {
        effectFn();
      }
   });
}

/**
 *  function reactive(target) : set proxy on an object, tracker the active effect
 *  when be getted and trigger the effects in effect list
 * 
 */
const proxyMap=new WeakMap();

function reactive(target){
    // 检查对同一个对象的代理 a=reactive(obj) b=reactiveobj a===b
    if(proxyMap.has(target)) {
        return proxyMap.get(target)
    }
    if(!isObject(target)) {
        console.warn('target is not an object');
        return target
    }
    //检查重复代理 reactive(reactiveObj)=reactiveObj
    if(isReactive(target)) {
        return target
    }
    const proxy=new Proxy(target,{
        get(target,key,receiver){
            if(key=='__isReactive'){
                return true
            }
           const res=Reflect.get(target,key,receiver);
           track(target,key);
           //对象深层代理
           return isObject(res)?reactive(res):res
        },
        set(target,key,value,receiver){
           const oldValue=Reflect.get(target,key,receiver);
           if(key!=='length'&&!hasChanged(oldValue,value)){
               return true
           }         
           const res=Reflect.set(target,key,value,receiver);
           trigger(target,key);
           return res
        }
    });
    proxyMap.set(target,proxy);
    return proxy
}
//特殊代理key并不真实存在
function isReactive(target){
     return target.__isReactive
}

function ref(value){
   return reactive({value:value})
}

function computed(getter){
    return new computedImpl(getter)
}
class computedImpl{
    constructor(getter){
        this.__dirty=true;
        this.__value=undefined;
        this.__effect=effect(getter,{
            lazy:true,
            scheduler:()=>{
                this.__dirty=true;
                //依赖改变后虽然不会执行effectFn,但是要通知targetMap里的所有effect函数更新
                trigger(this,'value');
            }
        });
    }
    get value(){
        //如果依赖改变，执行computed函数重新计算。所以computed函数应该是纯函数而非副作用函数
          if(this.__dirty){
            this.__value=this.__effect();
            this.__dirty=false;
            //computed自己也是响应式的，其他effect函数get computed函数的时候会引发track
            track(this,'value');
          }
          return this.__value
    }
}

const queue=[];
let isFlushing=false;
let currentFlushPromise=null;
function queueJob(job){
    if(!queue.length||!queue.includes(job)){
        queue.push(job);
    }
    if(!isFlushing){
        queueFlush();
        isFlushing=true;
    }
}

function queueFlush(){
   currentFlushPromise=Promise.resolve().then(flushJobs);
}
function flushJobs(){
    try{
        for(let i=0;i<queue.length;++i){
            queue[i]();
        }
    }finally{
        isFlushing=false;
        queue.length=0;
        currentFlushPromise=null;
    }
}

function nextTick(fn){
    //如果执行钩子的时候任务队列为空，直接放到微任务队列，否则放到当前执行的微任务的微任务队列
    const p=currentFlushPromise || Promise.resolve();
    //支持 await nextTick()
    return fn?p.then(fn):p
}

function updateProps(instance, vnode) {
  const { type: Component, props: vnodeProps } = vnode;
  const props = (instance.props = {});
  const attrs = (instance.attrs = {});
  for (const key in vnodeProps) {
    if (Component.props?.includes(key)) {
      props[key] = vnodeProps[key];
    } else {
      attrs[key] = vnodeProps[key];
    }
  }

  instance.props = reactive(instance.props);
}

function fallThrough(instance, subTree) {
  if (Object.keys(instance.attrs).length) {
    subTree.props = {
      ...subTree.props,
      ...instance.attrs,
    };
  }
}

function mountComponent(vnode, container, anchor, patch) {
  const { type: Component } = vnode;

  const instance = (vnode.component = {
    props: null,
    attrs: null,
    setupState: null,
    ctx: null,
    subTree: null,
    isMounted: false,
    update: null,
    next: null,
  });

  updateProps(instance, vnode);

  instance.setupState = Component.setup?.(instance.props, {
    attrs: instance.attrs,
  });

  instance.ctx = {
    ...instance.props,
    ...instance.setupState,
  };
  //模板替代render函数
  if(!Component.render && Component.template){
    const {template}=Component;
    const code=compile(template);
    Component.render=new Function('ctx',code);
  }
  instance.update = effect(() => {
    if (!instance.isMounted) {
      // mount
      const subTree = (instance.subTree = normalizeVNode(
        Component.render(instance.ctx)
      ));

      fallThrough(instance, subTree);

      patch(null, subTree, container, anchor);
      vnode.el = subTree.el;
      instance.isMounted = true;
    } else {
      // update

      if (instance.next) {
        // 被动更新
        vnode = instance.next;
        instance.next = null;
        updateProps(instance, vnode);
        instance.ctx = {
          ...instance.props,
          ...instance.setupState,
        };
      }

      const prev = instance.subTree;
      const subTree = (instance.subTree = normalizeVNode(
        Component.render(instance.ctx)
      ));

      fallThrough(instance, subTree);

      patch(prev, subTree, container, anchor);
      vnode.el = subTree.el;
    }
  },{
    scheduler:queueJob
  });
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
function patch(n1,n2,container,anchor){
    if(n1&&!isSameVnode(n1,n2)){
        anchor=(n1.anchor||n1.el).nextSibling;
        unmount(n1);
        n1=null;
    }
   const {shapeFlag} =n2;
   if(shapeFlag&ShapeFlags.COMPONENT) processComponent(n1,n2,container,anchor);
   else if(shapeFlag&ShapeFlags.TEXT) processText(n1,n2,container,anchor);
   else if(shapeFlag&ShapeFlags.FRAGMENT) processFragment(n1,n2,container,anchor);
   else if(shapeFlag&ShapeFlags.ELEMENT) processElement(n1,n2,container,anchor);
   
}

function unmount(vnode){
    const {shapeFlag,el}=vnode;
    if(shapeFlag&ShapeFlags.COMPONENT) ;
    else if(shapeFlag&ShapeFlags.FRAGMENT) unmountFragment(vnode);
    else {
        //text或element类型直接把自己所在的节点remove掉
        el.parentNode.removeChild(el);
    }
}

function isSameVnode(n1,n2){
    return n1.type===n2.type
}

function processComponent(n1,n2,container,anchor){
       if(n1);else {
         mountComponent(n2,container,anchor,patch);
       }
}


//fragment对应处理
function unmountFragment(vnode){
     const {el:cur,anchor:end}=vnode;
     const {parentNode}=cur;
     while(cur!==end){
         let next=cur.nextSibling;
         parentNode.removeChild(cur);
         cur=next;
     }
     parentNode.removeChild(end);
}
function processFragment(n1,n2,container,anchor){
    const fragmentStartAnchor=(n2.el=n1?n1.el:document.createTextNode(''));
    const fragmentEndAnchor=(n2.anchor=n1?n1.anchor:document.createTextNode(''));
    if(n1){
       patchChildren(n1,n2,container,fragmentEndAnchor);
    }else {
        container.insertBefore(fragmentStartAnchor,anchor);
        container.insertBefore(fragmentEndAnchor,anchor);
        mountChildren(n2.children,container,fragmentEndAnchor);
    }
}
//text对应处理
function processText(n1,n2,container,anchor){
    if(n1){
       n2.el=n1.el;
       n1.el.textContent=n2.children;
    }else {
        mountTextNode(n2,container,anchor);
    } 
}

function mountTextNode(vnode,container,anchor){
    const textNode=document.createTextNode(vnode.children);
        container.insertBefore(textNode,anchor);
        vnode.el=textNode;
}


//element对应处理
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
//children对应处理

//处理数组类型的children
function mountChildren(children,container,anchor){
           children.forEach(child=>{
            //递归挂载children
            patch(null,child,container,anchor);
        });
}
function unmountChildren(children){
    children.forEach(child=>unmount(child));
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
            if(c1[0]&&c1[0].key!=null &&c2[0]&&c2[0].key!=null){
                patchKeyedChildren(c1,c2,container,anchor);
            }
            else {
                patchUnkeyedChildren(c1,c2,container,anchor);
            }
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
function patchUnkeyedChildren(c1,c2,container,anchor){
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

//朴素diff算法，根据比对新旧children list，以旧list为模板进行增删改
function patchKeyedChildren(c1, c2, container, anchor) {
    const map = new Map();
    c1.forEach((prev, j) => {
      map.set(prev.key, { prev, j });
    });
    let maxNewIndexSoFar = 0;
    for (let i = 0; i < c2.length; i++) {
      const next = c2[i];
      //第一个插入原来的第一个之前，之后依次插入第一个后面
      const curAnchor = i === 0 ? c1[0].el : c2[i - 1].el.nextSibling;
      if (map.has(next.key)) {
        const { prev, j } = map.get(next.key);
        patch(prev, next, container, anchor);
        if (j < maxNewIndexSoFar) {
          //移动节点
          container.insertBefore(next.el, curAnchor);
        } else {
          maxNewIndexSoFar = j;
        }
        map.delete(next.key);
      } else {
        //旧节点中没有的节点，插入curAnchor
        patch(null, next, container, curAnchor);
      }
    }
    map.forEach(({ prev }) => {
      unmount(prev);
    });
  }

function createApp(rootComponent){
    const app={
        mount(rootContainer){
            if(isString(rootContainer)){
                rootContainer=document.querySelector(rootContainer);
            }
            render(h(rootComponent),rootContainer);
        }
    };
    return app
}

const MiniVue = (window.MiniVue = {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick,
  reactive,
  ref,
  computed,
  effect,
  compile,
});

exports.MiniVue = MiniVue;
