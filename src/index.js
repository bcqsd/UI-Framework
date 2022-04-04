import {Fragment, h, render} from './runtime'
const vnode=h(
  'div',{
      class: 'a b',
      style:{
          border:'1px solid',
          fontSize:'14px',
      },
      onClick:()=>console.log('click'),
      id:'foo',
      checked,
      custom:false,
  },
  [
      h('ul',null,[
          h('li',{style:{color:'red'}},'1'),
          h('li',null,'2'),
          h('li',{style:{color:'blue'}},'1'),
          h(Fragment,null,[h('li',null,'4'),h('li')]),
          h('li',null,[h(Text,null,'hello world')]),
      ])
  ]
)
render(vnode,document.body)