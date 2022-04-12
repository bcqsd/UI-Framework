import { render, h, Text, Fragment } from './runtime/index';
import { ref } from './reactive/index';

const Comp = {
  setup() {
    const count = ref(0);
    const add = () => {
      count.value++;
      console.log(count.value);
    };
    return {
      count,
      add,
    };
  },
  render(ctx) {
      console.log(ctx.count.value)
    return [
      h('div', null, ctx.count.value),
      h(
        'button',
        {
          onClick: ctx.add,
        },
        'add'
      ),
    ];
  },
};

const vnode = h(Comp);
render(vnode, document.body); // 渲染为<div class="a" bar="bar">foo</div>