import { compile } from './compiler/compile';
import { createApp, render, h, Text, Fragment, nextTick } from './runtime/index';
import { reactive, ref, computed, effect } from './reactive/index';
export const MiniVue = window.MiniVue = {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick,
  reactive,
  ref,
  computed,
  effect,
  compile
};