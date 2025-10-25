/** @jsx h */
import { h, render } from "./fuse/dom";
import { signal } from "./fuse/reactivity";

function Counter() {
    const count = signal(0);
    return (
        <div>
            <h1>Count: {() => count.get()}</h1>
            <button onClick={() => count.set(count.get() + 1)}>Increment</button>
            <button onClick={() => count.set(count.get() - 1)}>Decrement</button>
        </div>
    )
}

render(<Counter />, document.body);