import { signal, computed, Signal, ComputedSignal } from "../reactivity";
import { PathMatcher } from "./PathMatcher";
import { RouteParams, IRouter, RouteGuard, Middleware, NavigationContext, GuardResult } from "./types";

export class Router implements IRouter {
    public readonly currentPath: Signal<string>;
    public readonly currentParams: ComputedSignal<RouteParams>;
    public readonly currentRouteParams: ComputedSignal<RouteParams>;
    private matcher = new PathMatcher();
    private currentSearch: Signal<string>;
    private patterns = signal<string[]>([]);
    private guards = new Map<string, RouteGuard[]>();
    private middlewares: Middleware[] = [];

    constructor() {
        this.currentPath = signal(window.location.pathname);
        this.currentSearch = signal(window.location.search);
        this.currentRouteParams = computed(() => {
            for (const p of this.patterns.value) {
                const params = this.matcher.match(this.currentPath.value, p);
                if (params) return params;
            }
            return {};
        });
        this.currentParams = computed(() => ({
            ...this.currentRouteParams.value,
            ...this.matcher.parseQuery(this.currentSearch.value)
        }));
        window.addEventListener('popstate', () => {
            this.handleNavigation(window.location.pathname);
        });
    }

    private handleNavigation(to: string): void {
        const from = this.currentPath.value;
        const params = this.currentRouteParams.value;
        const context: NavigationContext = { from, to, params };
        
        for (const [pattern, routeGuards] of this.guards.entries()) {
            if (this.matcher.match(to, pattern)) {
                for (const guard of routeGuards) {
                    const result = guard(context);
                    const guardResult: GuardResult = typeof result === 'boolean' 
                        ? { allow: result } 
                        : result;
                    
                    if (!guardResult.allow) {
                        if (guardResult.redirect) {
                            this.navigate(guardResult.redirect, true);
                        }
                        return;
                    }
                }
            }
        }

        this.runMiddlewares(context, () => {
            const [pathname, search = ''] = to.split('?');
            this.currentPath.value = pathname;
            this.currentSearch.value = search ? '?' + search : '';
        });
    }

    private runMiddlewares(context: NavigationContext, final: () => void): void {
        let index = 0;
        const next = () => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                middleware(context, next);
            } else {
                final();
            }
        };
        next();
    }

    navigate(path: string, replace = false): void {
        const [pathname] = path.split('?');
        window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
        this.handleNavigation(pathname);
    }

    back = () => window.history.back();
    forward = () => window.history.forward();

    registerPattern(pattern: string): void {
        if (!this.patterns.value.includes(pattern)) {
            this.patterns.value = [...this.patterns.value, pattern];
        }
    }

    addGuard(pattern: string, guard: RouteGuard): void {
        if (!this.guards.has(pattern)) {
            this.guards.set(pattern, []);
        }
        this.guards.get(pattern)!.push(guard);
    }

    addMiddleware(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }

    match(pattern: string): ComputedSignal<RouteParams | null> {
        this.registerPattern(pattern);
        return computed(() => this.matcher.match(this.currentPath.value, pattern));
    }
}