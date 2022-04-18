import { generate } from "./codegen";
import { parse } from "./parse";
export function compile(template) {
  const ast = parse(template);
  const code = generate(ast);
  return code;
}