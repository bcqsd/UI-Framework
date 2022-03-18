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
const arrayProto=Array.prototype
//array的拦截器
export const arrayMethods=Object.create(arrayProto);
['push','pop','shift','unshift','splice','sort','reverse'].forEach(method=>{
    const original=arrayProto[method]
    Object.defineProperty(arrayMethods,method,{
        enumerable:false,
        writable:true,
        configurable:true,
        value:function mutator(...args){
            //dosomething
            return original.apply(this,args)
        }
    })
})