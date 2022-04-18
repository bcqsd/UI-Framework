export const NodeTypes = {
  ROOT: 'ROOT',
  ELEMENT: 'ELEMENT',
  TEXT: "TEXT",
  SIMPLE_EXPRESSION: "SIMPLE_EXPRESSION",
  INTERPOLATION: 'INTERPOLATION',
  ATTRIBUTE: "ATTRIBUTE"
};
export const ELementTypes = {
  ELEMENT: 'ELEMENT',
  COMPONENT: 'COMPONENT'
};
export function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children
  };
}