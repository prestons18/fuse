// Memoization utilities for Fuse

export function memo<T>(fn: () => T, deps: any[] | (() => any[])): () => T {
  let cachedResult: T;
  let cachedDeps: any[] = [];
  let initialized = false;
  
  return () => {
    const currentDeps = typeof deps === 'function' ? deps() : deps;
    
    // Check if dependencies have changed
    const depsChanged = !initialized || 
      currentDeps.length !== cachedDeps.length ||
      currentDeps.some((dep, i) => dep !== cachedDeps[i]);
    
    if (depsChanged) {
      cachedResult = fn();
      cachedDeps = [...currentDeps];
      initialized = true;
    }
    
    return cachedResult;
  };
}

export function memoComponent<P extends Record<string, any>>(
  Component: (props: P) => any
): (props: P) => any {
  let prevProps: P;
  let cachedResult: any;
  
  return (props: P) => {
    const propsChanged = !prevProps || 
      Object.keys(props).some(key => props[key] !== prevProps[key]) ||
      Object.keys(prevProps).some(key => !(key in props));
    
    if (propsChanged) {
      cachedResult = Component(props);
      prevProps = { ...props };
    }
    
    return cachedResult;
  };
}

export function useMemo<T>(fn: () => T, deps: any[] | (() => any[])): () => T {
  return memo(fn, deps);
}
