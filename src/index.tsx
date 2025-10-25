/** @jsx h */
import { h, render, For } from "./fuse/dom";
import { signal, computed, onCleanup, onMount } from "./fuse/reactivity";

function Timer() {
    const time = signal(0);
    
    // Cleanup demo
    onMount(() => {
        const interval = setInterval(() => {
            time.set(time.get() + 1);
        }, 1000);
        
        onCleanup(() => {
            console.log("Cleaning up timer interval");
            clearInterval(interval);
        });
    });
    
    return <p>Timer: {() => time.get()}s</p>;
}

function Counter() {
    const count = signal(0);
    const showTimer = signal(true);
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
            <button onClick={() => showTimer.set(!showTimer.get())}>
                Toggle Timer (test cleanup)
            </button>
            {() => showTimer.get() ? <Timer /> : null}
            <ul>
                <For each={() => items.get()}>{(item: number) => <li>Item {item}</li>}</For>
            </ul>
        </>
    )
}

render(<Timer />, document.body);