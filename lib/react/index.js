function createElement(type, props, ...children) {
  return {
    type,
    props: { ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function render(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
  element.props.children.forEach(child => render(child, dom)); //挂载属性和方法

  const isProperty = key => key !== 'children' && !/^on[A-Z].*/.test(key);

  Object.keys(element.props).filter(isProperty).forEach(key => dom[key] = element.props[key]);
  container.appendChild(dom);
}

const Didact = {
  createElement,
  render
};
/** @jsx Didact.createElement */

const element = Didact.createElement("div", {
  id: "foo"
}, Didact.createElement("a", null, "bar"), Didact.createElement("b", null));
const container = document.getElementById('root');
Didact.render(element, container);