export function isObject(target){
    return typeof target==='object' &&target!=null
}
export function isFunction(target){
    return typeof target ==='function'
}

export function isArray(target){
    return Array.isArray(target)
}