import { render, h, Text, Fragment,nextTick,createApp } from './runtime/index';
import { ref } from './reactive/index';

const Comp = {
  setup() {
    const count = ref(0);
    const add = () => {
      count.value++;
      count.value++;
      count.value++;
    };
    return {
      count,
      add,
    };
  },
  render(ctx) {
      console.log('111')
    return [
      h('div', {id:'div'}, ctx.count.value),
      h(
        'button',
        {
          onClick: ctx.add,
          id:'btn'
        },
        'add'
      ),
    ];
  },
};

createApp(Comp).mount(document.body)
const div=document.getElementById('div')
const btn=document.getElementById('btn')
btn.click()
nextTick(()=>{
  console.log(div.innerHTML)
})