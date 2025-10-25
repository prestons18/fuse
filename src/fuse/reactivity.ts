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

export interface Signal<T> {
    (): T;
    (v: T): void;
    get(): T;
    set(v: T): void;
    value: T;
}

export function signal<T>(initialValue: T): Signal<T> {
    const subscribers = new Set<() => void>();
    let value = initialValue;

    const read = () => {
        if (currentEffect) subscribers.add(currentEffect);
        return value;
    };

    const write = (v: T) => {
        value = v;
        subscribers.forEach((fn) => fn());
    };

    // This is callable, but also has get/set methods
    const signalFn = function(v?: T) {
        if (arguments.length === 0) {
            return read();
        } else {
            write(v as T);
        }
    } as Signal<T>;

    // Explicit get/set methods
    signalFn.get = read;
    signalFn.set = write;

    // Uses a Proxy to enable auto-unwrapping via property access
    return new Proxy(signalFn, {
        get(target, prop) {
            if (prop === 'value') {
                return read();
            }
            if (prop === 'get' || prop === 'set') {
                return target[prop];
            }
            // For any other property access, return the value's property
            const val = read();
            if (val && typeof val === 'object' && prop in val) {
                return (val as any)[prop];
            }
            return target[prop as keyof typeof target];
        },
        set(target, prop, newValue: T) {
            if (prop === 'value') {
                write(newValue);
                return true;
            }
            return false;
        }
    });
}

export interface ComputedSignal<T> {
    (): T;
    get(): T;
    value: T;
}

export function computed<T>(fn: () => T): ComputedSignal<T> {
    const s = signal<T>(undefined as T);
    effect(() => s.set(fn()));
    
    const computedFn = function() {
        return s.get();
    } as ComputedSignal<T>;
    
    computedFn.get = () => s.get();
    
    return new Proxy(computedFn, {
        get(target, prop) {
            if (prop === 'value' || prop === 'get') {
                return s.get();
            }
            return target[prop as keyof typeof target];
        }
    });
}