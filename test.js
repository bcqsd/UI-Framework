import { MiniVue } from "./src/index";

const {
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
  }=MiniVue

  const test='tes22'
  let str=`<div id="3">{test} hello</div>`

  let code=compile(str)
console.log(code)