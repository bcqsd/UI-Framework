import { effect } from "./reactive/effect";
import { reactive } from "./reactive/reactive";

window.t=reactive({
    value:1
})
effect(()=>{
    console.log('t.value is: '+t.value)
})