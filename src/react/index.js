function createDom(fiber){
 const dom=fiber.type==='TEXT_ELEMENT'
 ? document.createTextNode("")
 :document.createElement(fiber.type)
 
 const isProperty=key=>key!=='children'
 Object.keys(fiber.props).filter(isProperty).forEach(key=>dom[key]=fiber.props[key])

 return dom
}

function createTextElement(text){
    return {
        type:"TEXT_ELEMENT",
        props:{
            nodeValue:text,
            children:[]
        }
    }
}
let nextUnitOfWork=null

function render(element,container){
    nextUnitOfWork= {
        dom:container,
        props:{
            children:[element]
        }
    }
}

const Didact={
    createElement,
    render,
}
/** @jsx Didact.createElement */
const element=(
    <div id="foo">
          <a>bar</a>
          <b/>
    </div>
)


function workLoop(deadline){
    let shouldYield=false
    //在有任务且时间充足的情况下不断执行
    while(nextUnitOfWork &&!shouldYield){
        nextUnitOfWork=perfromUnitOfWork(nextUnitOfWork)
        shouldYield=deadline.timeRemaining()<1
    }
    //把控制权还给浏览器
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function perfromUnitOfWork(fiber){
    //创建fiber节点对应的dom树
   if(!fiber.dom) {
       fiber.dom=createDom(fiber)
   }
   if(fiber.parent){
       fiber.parent.dom.appendChild(fiber.dom)
   }
   //创建该fiber节点对应的children fiber节点
   const elements=fiber.props.children
   let index=0
   let prevSibling=null

   while(index<elements.length){
       const element=elements[index]
       const newFiber={
           type:element.type,
           props:element.props,
           parent:fiber,
           dom:null
       }
       if(index==0){
           fiber.child=newFiber
       }else{
           prevSibling.sibing=newFiber
       }
       prevSibling=newFiber
       index++
   }
   //执行渲染
   if(fiber.child){
       return fiber.child
   } 
   let nextFiber=fiber
   while(nextFiber){
       if(nextFiber.sibing){
           return nextFiber.sibing
       }
       nextFiber=nextFiber.parent
   }
}



const container=document.getElementById('root')
Didact.render(element,container)