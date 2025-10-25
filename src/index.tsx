/** @jsx h */
import { h, render, For } from "./fuse/dom";
import { signal, computed } from "./fuse/reactivity";

function Counter() {
    const count = signal(0);
    const doubled = computed(() => count.get() * 2);
    const isEven = computed(() => count.get() % 2 === 0 ? "even" : "odd");
    const items = computed(() => Array.from({ length: count.get() }, (_, i) => i + 1));
    return (
        <>
            <h1>Count: {() => count.get()}</h1>
            <p>Doubled: {() => doubled.get()}</p>
            <p>Is {() => isEven.get()}</p>
            <button onClick={() => count.set(count.get() + 1)}>Increment</button>
            <button onClick={() => count.set(count.get() - 1)}>Decrement</button>
            <ul>
                <For each={() => items.get()}>{(item: number) => <li>Item {item}</li>}</For>
            </ul>
        </>
    )
}

render(<Counter />, document.body);