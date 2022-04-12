import { isArray, isObject, isString } from "../utils/index"

export const ShapeFlags={
    ELEMENT:1,
    TEXT:1<<1,
    FRAGMENT:1<<2,
    COMPONENT:1<<3,
    TEXT_CHILDREN:1<<4,
    ARRAY_CHILDREN:1<<5,
    CHILDREN:(1<<4) | (1<<5)
}
export const Text=Symbol('Text')
export const Fragment=Symbol('Fragment')
/**
 * 
 * @param {string | Object | Text | Fragment} type  'div' Component Text Fragment 
 * @param {Object | null} props 
 * @param {string | array | null} children 
 * @returns  VNode
 */
export function h(type,props,children){
    let shapeFlag=0
    if(isString(type)) shapeFlag=ShapeFlags.ELEMENT
    else if(type ===Text) shapeFlag=ShapeFlags.TEXT
    else if(type===Fragment) shapeFlag=ShapeFlags.FRAGMENT
    else shapeFlag=ShapeFlags.COMPONENT

    if(isString(children)) shapeFlag|=ShapeFlags.TEXT_CHILDREN
    else if(isArray(children)) shapeFlag |=ShapeFlags.ARRAY_CHILDREN
    return {
        type,
        props,
        children,
        shapeFlag,
        el:null,
        anchor:null
    }
}

export function normlizeVNode(result){
    if(isArray(result)){
        return h(Fragment,null,result)
    }
    if(isObject(result)) return result
    return h(Text,null,result.toString())
}