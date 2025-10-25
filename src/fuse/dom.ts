import { effect } from "./reactivity";

export function h(type: any, props: any, ...children: any[]) {
  if (typeof type === "function") return type({ ...props, children });
  
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
      const t = parent.appendChild(document.createTextNode(""));
      return effect(() => (t.textContent = child()));
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(child));
  };
  
  children.flat().forEach((c) => mount(el, c));
  return el;
}

export function render(vnode: any, container: HTMLElement) {
  container.replaceChildren(vnode);
}