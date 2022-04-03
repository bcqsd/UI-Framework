import { effect } from "./reactive/effect";
import { reactive } from "./reactive/reactive";
import {ref} from './reactive/ref'
import { computed } from "./reactive/computed";
const num=ref(0)
const c=(window.c=computed(()=>{
    console.log(`calculate c.value`);
    return num.value*2
}))
