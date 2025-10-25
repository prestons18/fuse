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

export function For({ each, children }: any) {
  const render = children[0];
  if (typeof each !== "function") return each.map(render);
  
  const anchor = document.createTextNode("");
  const map = new Map<any, Node>();
  effect(() => {
    const items = each();
    const used = new Set();
    items.forEach((item: any, i: number) => {
      const key = item?.key ?? item;
      used.add(key);
      if (!map.has(key)) {
        const node = render(item, i);
        map.set(key, node);
        anchor.parentNode?.insertBefore(node, anchor);
      }
    });
    map.forEach((node, key) => {
      if (!used.has(key)) {
        node.parentNode?.removeChild(node);
        map.delete(key);
      }
    });
  });
  return anchor;
}