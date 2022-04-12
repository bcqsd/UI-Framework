import {Fragment, h, render,Text} from './runtime/index.js'

const Comp={
    props:['foo'],
    render(ctx){
        return h('div',{class:'a',id:ctx.bar},ctx.foo)
    }
}

const vnodeProp={
    foo:'foo',
    bar:'bar'
}

const vnode=h(Comp,vnodeProp)

render(vnode,document.body)