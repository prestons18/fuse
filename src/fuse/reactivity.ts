let currentEffect: (() => void) | null = null;
let currentCleanups: (() => void)[] = [];

export function effect(fn: () => void): () => void {
    let cleanups: (() => void)[] = [];
    
    const run = () => {
        // Run existing cleanups before re-running effect
        cleanups.forEach(cleanup => cleanup());
        cleanups = [];
        
        currentEffect = run;
        currentCleanups = cleanups;
        fn();
        currentEffect = null;
        currentCleanups = [];
    }
    
    run();
    
    // Return dispose function
    return () => {
        cleanups.forEach(cleanup => cleanup());
        cleanups = [];
    };
}

export function onCleanup(fn: () => void) {
    if (currentCleanups) {
        currentCleanups.push(fn);
    }
}

export function onMount(fn: () => void) {
    fn();
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

export function computed<T>(fn: () => T) {
    const s = signal<T>(undefined as T);
    effect(() => s.set(fn()));
    return { get: () => s.get() };
}