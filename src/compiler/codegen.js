import { NodeTypes } from "./ast";
//根据ast树生成code
export function generate(ast) {
    const ret=traverseNode(ast)
    return `return ${ret}`
}

function traverseNode(node) {
    switch (node.type) {
        case NodeTypes.ROOT:
           if(node.children.length==1){
               return traverseNode(node.children[0])
           }     
           const result=traverseChildren(node)
           return result;
        case NodeTypes.TEXT:
          createTextVNode(node)
            break;
        case NodeTypes.INTERPOLATION:
            //表达式节点的content是一个有isStatic标记的text节点
           createTextVNode(node.content)
            break;
        case NodeTypes.ELEMENT:
        createElementVnode(node)
            break;
    }
}

function createTextVNode(node){
    const child=createText(node)
    return `h(Text,null,${child})`
}

function createText({isStatic=true,content=''}={}){
    return isStatic?JSON.stringify(content):content
}

function createElementVnode(node){
    const {children} =node
    const tag=JSON.stringify(node.tag)
    const propArr=createPropArr(node)

    const propStr=propArr.length?`{ ${propArr.join(',')}}`:'null'
    if(!children.length){
       if(propStr==='null'){
            return `h(${tag})`
       }
       return  `h(${tag}),${propStr}`
    }
    let childrenStr=traverseChildren(node)
    return `h(${tag},null,${childrenStr})`
}

function traverseChildren(node){
   const {children} =node
   if(children.length===1){
       const child=children[0]
       if(child.type===NodeTypes.TEXT){
           return createText(child)
       }
       if(child.type===NodeTypes.INTERPOLATION){
           return createText(child.content)
       }

   }
   const results=[]
   for(let i=0;i<children.length;++i){
       const child=children[i]
       const result=traverseNode(child)
       results.push(result)
   }

   return `[${results.join(',')}]`
}

function createPropArr(node){
  const {props}=node
  return[
      ... props.map(prop=>`${prop.name}:${createText(prop.value)}`),
       //todo 
     ]
}