let currentEffect: (() => void) | null = null; 

export function effect(fn: () => void) {
    const run = () => {
        currentEffect = run;
        fn();
        currentEffect = null;
    }
    run();
}

export function signal<T>(value: T) {
    const subscribers = new Set<() => void>();

    return {
        get() {
            if (currentEffect) subscribers.add(currentEffect);
            return value;
        },
        set(v: T) {
            value = v;
            subscribers.forEach((fn) => fn());
        }
    }
}

export const computed = <T>(fn: () => T) => { const s = signal(fn()); effect(() => s.set(fn())); return s; }