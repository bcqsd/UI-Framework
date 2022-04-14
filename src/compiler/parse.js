import {NodeTypes,ELementTypes,createRoot} from './ast'

export function parse(content){
    const context=createParserContext(content)
    const children=parseChildren(context)
    return createRoot(children)   
}

function createParserContext(content){
    return {
        source:content,
        options:{
           delimiters:['{{','}}']
        },
    }
}

function parseChildren(context){
    const nodes=[]
    while(!isEnd(context)){
        const s=context.source
        let node
        if(s.startsWith(context.options.delimiters[0])){
            node=parseInterpolation(context)    
        }   else if(s[0]==='<'){
              node=parseElement(context) 
        }   else{
             node=parseText(context)
        }     
        nodes.push(node)
    }
    return nodes
}
//缺点：不能解析a<b
function parseText(context){
   let endIndex=context.source.length
    const endTokens=['<',context.options.delimiters[0]]
    //更新endIndex为最小的解析结束标志
    for(let i=0;i<endTokens.length;++i){
        let index=context.source.indexOf(endTokens[i])
        if(index!=-1&&index<endIndex) {
            endIndex=index
        }
    }
   const content=parseTextData(context,length)
   return {
       type:NodeTypes.TEXT,
       content
   }
}
function parseTextData(context,length){
    const content=context.source.slice(0,length)
    advanceBy(context,length)
    return content
}

function parseInterpolation(context){

}

function parseElement(context){

}

function isEnd(context){
   const s=context.source
   return s.startsWith('</') || !s
}

function advanceBy(context,numberOfCharacters){
    context.source=context.source.slice(numberOfCharacters)

}

function advanceSpaces(context){
    const match=/^[\t\r\n\f]+/.exec(context.source)
    if(match){
        advanceBy(context,match[0].length)
    }     
}