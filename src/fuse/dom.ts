import { effect } from "./reactivity";

export function h(type: any, props: any, ...children: any[]) {
  if (typeof type === "function") return type({ ...props, children });
  if (!type) return children.flat();
  
  const el = document.createElement(type);
  
  for (const k in props) {
    const v = props[k];
    if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "function") effect(() => (el[k] = v()));
    else el[k] = v;
  }
  
  const mount = (parent: HTMLElement, child: any): any => {
    if (Array.isArray(child)) return child.forEach((c) => mount(parent, c));
    if (typeof child === "function") {
      const anchor = parent.appendChild(document.createTextNode(""));
      let nodes: Node[] = [];
      return effect(() => {
        const result = child();
        nodes.forEach(n => parent.removeChild(n));
        nodes = Array.isArray(result) ? result : [document.createTextNode(result)];
        nodes.forEach(n => parent.insertBefore(n, anchor));
      });
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(child));
  };
  
  children.flat().forEach((c) => mount(el, c));
  return el;
}

export function render(vnode: any, container: HTMLElement) {
  container.replaceChildren(...(Array.isArray(vnode) ? vnode : [vnode]));
}

export const For = ({ each, children }: any) => (typeof each === "function" ? () => each().map(children[0]) : each.map(children[0]));