import { effect } from "./reactivity";

export type Child = Node | string | number | boolean | null | undefined;
export type Children = Child | Child[] | (() => Child | Child[]);
type Props = Record<string, any> & { children?: Children };
type Component<P = any> = (props: P) => Node | Node[];
type ElementType = string | Component | null;

interface ForProps<T> {
  each: T[] | (() => T[]);
  children: [(item: T, index: number) => Node];
}

const disposers = new WeakMap<Node, Set<() => void>>();

function addDisposer(node: Node, dispose: () => void): void {
  if (!disposers.has(node)) {
    disposers.set(node, new Set());
  }
  disposers.get(node)!.add(dispose);
}

function cleanupNode(node: Node): void {
  const nodeDisposers = disposers.get(node);
  if (nodeDisposers) {
    nodeDisposers.forEach(dispose => dispose());
    disposers.delete(node);
  }
}

function mountChild(parent: Node, child: Children, anchor?: Node): void {
  if (child == null || child === false) return;
  
  if (Array.isArray(child)) {
    child.forEach(c => mountChild(parent, c, anchor));
    return;
  }
  
  if (typeof child === "function") {
    const marker = document.createTextNode("");
    const insertBefore = anchor || null;
    parent.insertBefore(marker, insertBefore);
    
    let mounted: Node[] = [];
    
    const dispose = effect(() => {
      const result = child();
      
      mounted.forEach(node => {
        cleanupNode(node);
        node.parentNode?.removeChild(node);
      });
      mounted = [];
      
      if (result == null || result === false) return;
      
      const nodes = Array.isArray(result) ? result : [result];
      nodes.forEach(node => {
        const el = node instanceof Node ? node : document.createTextNode(String(node));
        parent.insertBefore(el, marker);
        mounted.push(el);
      });
    });
    
    addDisposer(marker, dispose);
    return;
  }
  
  const node = child instanceof Node ? child : document.createTextNode(String(child));
  parent.insertBefore(node, anchor || null);
}

function setAttribute(el: HTMLElement | SVGElement, key: string, value: any): void {
  if (key.startsWith("on")) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
    addDisposer(el, () => el.removeEventListener(event, value));
    return;
  }
  
  if (typeof value === "function") {
    const dispose = effect(() => {
      const resolved = value();
      if (key === "className" || key === "class") {
        if (el instanceof SVGElement) {
          el.setAttribute('class', resolved);
        } else {
          el.className = resolved;
        }
      } else if (el instanceof SVGElement) {
        // For SVG elements, always use setAttribute to avoid read-only property errors
        el.setAttribute(key, String(resolved));
      } else if (key in el) {
        (el as any)[key] = resolved;
      } else {
        el.setAttribute(key, String(resolved));
      }
    });
    addDisposer(el, dispose);
    return;
  }
  
  if (key === "className" || key === "class") {
    if (el instanceof SVGElement) {
      el.setAttribute('class', value);
    } else {
      (el as HTMLElement).className = value;
    }
  } else if (el instanceof SVGElement) {
    // For SVG elements, always use setAttribute to avoid read-only property errors
    el.setAttribute(key, String(value));
  } else if (key in el) {
    (el as any)[key] = value;
  } else {
    el.setAttribute(key, String(value));
  }
}

const SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
  'ellipse', 'g', 'text', 'tspan', 'defs', 'use', 'symbol',
  'marker', 'clipPath', 'mask', 'pattern', 'linearGradient',
  'radialGradient', 'stop', 'image', 'foreignObject'
]);

export function h(
  type: ElementType,
  props: Props | null,
  ...children: Children[]
): Node | Node[] {
  if (typeof type === "function") {
    return type({ ...props, children });
  }
  
  if (!type) {
    const fragment = document.createDocumentFragment();
    children.flat(Infinity).forEach(child => mountChild(fragment, child));
    return fragment;
  }
  
  const el = SVG_TAGS.has(type)
    ? document.createElementNS('http://www.w3.org/2000/svg', type)
    : document.createElement(type);
  
  if (props) {
    for (const key in props) {
      if (key !== "children") {
        setAttribute(el, key, props[key]);
      }
    }
  }
  
  children.flat(Infinity).forEach(child => mountChild(el, child));
  
  return el;
}

export function render(vnode: Children, container: HTMLElement | null): void {
  if (!container) throw new Error("Container element not found");
  
  // Handle null/undefined/false
  if (vnode == null || vnode === false) {
    container.replaceChildren();
    return;
  }
  
  // Handle functions
  if (typeof vnode === "function") {
    const result = vnode();
    render(result, container);
    return;
  }
  
  // Handle arrays
  if (Array.isArray(vnode)) {
    const nodes = vnode.flatMap((child: Child) => {
      if (child == null || child === false) return [];
      if (typeof child === "function") {
        const result = (child as () => Child | Child[])();
        if (result instanceof Node) return result;
        if (Array.isArray(result)) return result.filter(n => n instanceof Node);
        return [];
      }
      return child instanceof Node ? child : document.createTextNode(String(child));
    });
    container.replaceChildren(...nodes);
    return;
  }
  
  // Handle single node or primitive
  const node = vnode instanceof Node ? vnode : document.createTextNode(String(vnode));
  container.replaceChildren(node);
}

export function For<T>({ each, children }: ForProps<T>): Node {
  const renderItem = children[0];
  
  if (typeof each !== "function") {
    const fragment = document.createDocumentFragment();
    each.forEach((item, i) => fragment.appendChild(renderItem(item, i)));
    return fragment;
  }
  
  const marker = document.createTextNode("");
  const tracked = new Map<any, { node: Node; item: T }>();
  let isFirstRun = true;
  
  const dispose = effect(() => {
    const items = each();
    const seen = new Set<any>();
    let prev: Node = marker;
    const nodesToInsert: Array<{ node: Node; after: Node }> = [];
    
    items.forEach((item, index) => {
      const key = (item as any)?.key ?? item;
      seen.add(key);
      
      let entry = tracked.get(key);
      
      if (!entry) {
        const node = renderItem(item, index);
        entry = { node, item };
        tracked.set(key, entry);
      }
      
      // Track nodes that need insertion
      if (entry.node.previousSibling !== prev) {
        if (isFirstRun) {
          nodesToInsert.push({ node: entry.node, after: prev });
        } else if (marker.parentNode) {
          marker.parentNode.insertBefore(entry.node, prev.nextSibling);
        }
      }
      
      prev = entry.node;
    });
    
    // On first run, defer insertion until marker is in DOM
    if (isFirstRun && nodesToInsert.length > 0) {
      queueMicrotask(() => {
        if (marker.parentNode) {
          nodesToInsert.forEach(({ node, after }) => {
            marker.parentNode!.insertBefore(node, after.nextSibling);
          });
        }
      });
    }
    
    tracked.forEach((entry, key) => {
      if (!seen.has(key)) {
        cleanupNode(entry.node);
        entry.node.parentNode?.removeChild(entry.node);
        tracked.delete(key);
      }
    });
    
    isFirstRun = false;
  });
  
  addDisposer(marker, dispose);
  return marker;
}