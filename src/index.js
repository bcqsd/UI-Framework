import {Fragment, h, render,Text} from './runtime/index.js'

render(
    h('ul',null,[
        h('li',null,'first'),
        h(Fragment,null,[]),
        h('li',null,'last'),
    ]),
    document.body
)

setTimeout(()=>{
    render(
        h('ul',null,[
            h('li',null,'first'),
            h(Fragment,null,[
                h('li',null,'middle')
            ]),
            h('li',null,'last'),
        ]),
        document.body
    )
},2000)