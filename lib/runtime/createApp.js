import { isString } from "../utils/index";
import { render } from "./render";
import { h } from "./vnode";
export function createApp(rootComponent) {
  const app = {
    mount(rootContainer) {
      if (isString(rootContainer)) {
        rootContainer = document.querySelector(rootContainer);
      }

      render(h(rootComponent), rootContainer);
    }

  };
  return app;
}