import { isBoolean } from "../utils/index";
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
export function patchProps(oldProps, newProps, el) {
  oldProps = oldProps || {};
  newProps = newProps || {};
  if (oldProps === newProps) return;

  for (const key in newProps) {
    const next = newProps[key];
    const prev = oldProps[key];
    if (prev !== next) patchDomProp(prev, next, key, el);
  }

  for (const key in oldProps) {
    if (newProps[key] == null) {
      patchDomProp(oldProps[key], null, key, el);
    }
  }
}

function patchDomProp(prev, next, key, el) {
  switch (key) {
    case 'class':
      el.className = next || "";
      break;

    case 'style':
      if (prev) {
        //移除不存在于next上的styleName
        for (const styleName in prev) {
          if (next[styleName] == null) {
            el.style[styleName] = '';
          }
        }
      }

      for (const styleName in next) {
        el.style[styleName] = next[styleName];
      }

      break;

    default:
      //事件 例如onClick
      if (/^on[A-Z]/.test(key)) {
        const eventName = key.slice(2).toLowerCase();
        if (prev) el.removeEventListener(eventName, prev);
        if (next) el.addEventListener(eventName, next); //原生标准prop属性
      } else if (domPropsRE.test(key)) {
        //  只写属性默认true
        if (next === '' && isBoolean(el[key])) next = true;
        el[key] = next;
      } else {
        //移除属性
        if (next == null || next === false) {
          el.removeAttribute(key);
        } else {
          el.setAttribute(key, next);
        }
      }

      break;
  }
}