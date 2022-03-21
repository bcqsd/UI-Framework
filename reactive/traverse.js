const seenObjects=new Set()

export function traverse(val){
    _traverse(val,seenObjects)
    seenObjects.clear()
}

function _traverse(val,seen){
  let i,keys
  const isA=Array.isArray(val)
  const isObj=Object.prototype.toString.call(obj)==='[object Object]'
  if((!isA&&!isObj)
    ||Object.isFrozen(val)){
      return
  }
  if(val.__ob__){
      const depId=val.__ob.__.dep.id 
      if(seen.has(depId)){
          return
      }
      seen.add(depId)
  }
  if(isA){
      i=val.length
      while(i--){
          _traverse(val[i],seen)
      }
  }else{
      keys=Object.keys(val)
      i=keys.length
      while(i--) _traverse(val[keys[i]],seen)
  }
}