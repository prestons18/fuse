let currentEffect: (() => void) | null = null; 

export function effect(fn: () => void) {
    const run = () => {
        currentEffect = run;
        fn();
        currentEffect = null;
    }
    run();
}