import { effect } from "./reactivity";

const disposers = new WeakMap<Node, (() => void)[]>();

function addDisposer(node: Node, dispose: () => void) {
  const list = disposers.get(node) || [];
  list.push(dispose);
  disposers.set(node, list);
}

function cleanupNode(node: Node) {
  const list = disposers.get(node);
  if (list) {
    list.forEach(dispose => dispose());
    disposers.delete(node);
  }
}

export function h(type: any, props: any, ...children: any[]) {
  if (typeof type === "function") return type({ ...props, children });
  if (!type) return children.flat();
  
  const el = document.createElement(type);
  
  for (const k in props) {
    const v = props[k];
    if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "function") {
      const dispose = effect(() => (el[k] = v()));
      addDisposer(el, dispose);
    }
    else el[k] = v;
  }
  
  const mount = (parent: HTMLElement, child: any): any => {
    if (Array.isArray(child)) return child.forEach((c) => mount(parent, c));
    if (typeof child === "function") {
      const anchor = parent.appendChild(document.createTextNode(""));
      let nodes: Node[] = [];
      const dispose = effect(() => {
        const result = child();
        nodes.forEach(n => {
          cleanupNode(n);
          parent.removeChild(n);
        });
        nodes = Array.isArray(result) ? result : [document.createTextNode(result)];
        nodes.forEach(n => parent.insertBefore(n, anchor));
      });
      addDisposer(anchor, dispose);
      return;
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
  const map = new Map<any, { node: Node; item: any; update?: (v: any) => void }>();
  const dispose = effect(() => {
    const items = each();
    const newKeys = new Set();
    let prev: Node = anchor;
    
    items.forEach((item: any, i: number) => {
      const key = item?.key ?? item;
      newKeys.add(key);
      let entry = map.get(key);
      
      if (!entry) {
        const node = render(item, i);
        entry = { node, item };
        map.set(key, entry);
      } else if (entry.item !== item) {
        entry.update?.(item);
        entry.item = item;
      }
      
      if (entry.node.previousSibling !== prev) {
        anchor.parentNode?.insertBefore(entry.node, prev.nextSibling);
      }
      prev = entry.node;
    });
    
    map.forEach((entry, key) => {
      if (!newKeys.has(key)) {
        cleanupNode(entry.node);
        entry.node.parentNode?.removeChild(entry.node);
        map.delete(key);
      }
    });
  });
  addDisposer(anchor, dispose);
  return anchor;
}