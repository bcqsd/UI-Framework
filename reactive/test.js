import { parsePath } from "./utils.js";
let a='我是'
let f=parsePath(a)
let obj={
    a:{
        b:{
            c:{
                data:1
            }
        }
    }
}
console.log(f(obj));