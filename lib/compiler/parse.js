import { NodeTypes, ELementTypes, createRoot } from './ast';
export function parse(content) {
  const context = createParserContext(content);
  const children = parseChildren(context);
  return createRoot(children);
}

function createParserContext(content) {
  return {
    source: content,
    options: {
      delimiters: ['{', '}']
    }
  };
}

function parseChildren(context) {
  const nodes = [];

  while (!isEnd(context)) {
    const s = context.source;
    let node;

    if (s.startsWith(context.options.delimiters[0])) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      node = parseElement(context);
    } else {
      node = parseText(context);
    }

    nodes.push(node);
  }

  let removedWhitedspaces = false;

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];

    if (node.type === NodeTypes.TEXT) {
      if (/[^\t\r\f\n ]/.test(node.content)) {
        node.content = node.content.replace(/[\t\r\f\n ]+/g, ' ');
      } else {
        const prev = nodes[i - 1];
        const next = nodes[i + 1];

        if (!prev || !next || prev.type == NodeTypes.ELEMENT && next.type === NodeTypes.ELEMENT && /[\r\n]/.test(node.content)) {
          //删除空白节点
          nodes[i] = null;
          removedWhitedspaces = true;
        } else {
          node.content = ' ';
        }
      }
    }
  }

  return removedWhitedspaces ? nodes : nodes.filter(Boolean);
} //缺点：不能解析a<b


function parseText(context) {
  let endIndex = context.source.length;
  const endTokens = ['<', context.options.delimiters[0]]; //更新endIndex为最小的解析结束标志

  for (let i = 0; i < endTokens.length; ++i) {
    let index = context.source.indexOf(endTokens[i]);

    if (index != -1 && index < endIndex) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content
  };
} // 传入r,解析[l,r)


function parseTextData(context, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}

function parseInterpolation(context) {
  const [open, close] = context.options.delimiters;
  advanceBy(context, open.length);
  const closeIndex = context.source.indexOf(close);
  const content = parseTextData(context, closeIndex).trim();
  advanceBy(context, close.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      isStatic: false
    }
  };
}

function parseElement(context) {
  const element = parseTag(context);

  if (element.isSelfClosing) {
    return element;
  }

  element.children = parseChildren(context);
  parseTag(context);
  return element;
}

function parseTag(context) {
  const match = /^<\/?([a-z]+)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceSpaces(context);
  const props = parseAttributes(context);
  const isSelfClosing = context.source.startsWith('/>');
  advanceBy(context, isSelfClosing ? 2 : 1);
  const tagType = isComponent(tag) ? ELementTypes.COMPONENT : ELementTypes.ELEMENT;
  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props,
    isSelfClosing,
    children: []
  };
}

function isComponent(tag) {
  //首字母大写是组件
  const reg = /^[A-Z]+/;
  return reg.exec(tag);
} //解析属性


function parseAttributes(context) {
  const props = [];

  while (context.source.length && !context.source.startsWith('>')) {
    let attr = parseAttribute(context);
    props.push(attr);
  }

  return props;
} //解析属性名


function parseAttribute(context) {
  const match = /^[^\t\r\n\f ][^\t\r\n\f />=]*/.exec(context.source);
  const name = match[0];
  advanceBy(context, name.length);
  advanceSpaces(context);
  let value;

  if (context.source[0] === '=') {
    advanceBy(context, 1);
    advanceSpaces(context);
    value = parseAttributeValue(context);
  }

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value
    }
  };
} //解析属性值


function parseAttributeValue(context) {
  advanceBy(context, 1);
  let endIndex = context.source.length;
  const endTokens = ['"', "'", '`', context.options.delimiters[1]]; //更新endIndex为最小的解析结束标志

  for (let i = 0; i < endTokens.length; ++i) {
    let index = context.source.indexOf(endTokens[i]);

    if (index != -1 && index < endIndex) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);
  advanceBy(context, 1);
  advanceSpaces(context);
  return content;
}

function isEnd(context) {
  const s = context.source;
  return !s || s.startsWith('</');
} //给定一个下标，跳转到下标位置


function advanceBy(context, numberOfCharacters) {
  context.source = context.source.slice(numberOfCharacters);
}

function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source);

  if (match) {
    advanceBy(context, match[0].length);
  }
}