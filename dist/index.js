// src/fuse/reactivity.ts
var currentEffect = null;
function effect(fn) {
  const run = () => {
    currentEffect = run;
    fn();
    currentEffect = null;
  };
  run();
}
function signal(value) {
  const subscribers = /* @__PURE__ */ new Set();
  return {
    get() {
      if (currentEffect) subscribers.add(currentEffect);
      return value;
    },
    set(v) {
      value = v;
      subscribers.forEach((fn) => fn());
    }
  };
}

// src/fuse/dom.ts
function h(type, props, ...children) {
  if (typeof type === "function") return type({ ...props, children });
  const el = document.createElement(type);
  for (const k in props) {
    const v = props[k];
    if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "function") effect(() => el[k] = v());
    else el[k] = v;
  }
  const mount = (parent, child) => {
    if (Array.isArray(child)) return child.forEach((c) => mount(parent, c));
    if (typeof child === "function") {
      const t = parent.appendChild(document.createTextNode(""));
      return effect(() => t.textContent = child());
    }
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(child));
  };
  children.flat().forEach((c) => mount(el, c));
  return el;
}
function render(vnode, container) {
  container.replaceChildren(vnode);
}

// src/index.tsx
function Counter() {
  const count = signal(0);
  return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h1", null, "Count: ", () => count.get()), /* @__PURE__ */ h("button", { onClick: () => count.set(count.get() + 1) }, "Increment"));
}
render(/* @__PURE__ */ h(Counter, null), document.body);
//# sourceMappingURL=index.js.map
