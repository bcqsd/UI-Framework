import { parse } from "./compiler/parse";

console.log(parse(`<div id={foo} onClick={ss}>hellp {ss2}</div>`))