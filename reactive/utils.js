const bailRE=/[^\w.$]/
//获取字符串对应的属性对象，例如传入obj和'a.b.c',返回obj.a.b.c 
/**
 * @param {string} path 
 * @returns {function} obj->obj.path
 */
export function parsePath(path){
    if(bailRE.test(path)){
        throw(new Error('属性路径不合法'))
    }
    const segments=path.split('.')
    return function(obj){
        segments.forEach(p=>{
            obj=obj[p]
        })
        return obj
    }
}
//给对象增加属性，默认不可枚举  
export function def(obj,key,val,enumerable){
    Object.defineProperty(obj,key,{
        value:val,
        enumerable:!!enumerable,
        writable:true,
        configurable:true
    })
}
