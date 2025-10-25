import { signal, computed, Signal, ComputedSignal } from "../reactivity";
import { PathMatcher } from "./PathMatcher";
import { RouteParams, IRouter } from "./types";

export class Router implements IRouter {
    public readonly currentPath: Signal<string>;
    public readonly currentParams: ComputedSignal<RouteParams>;
    public readonly currentRouteParams: ComputedSignal<RouteParams>;
    private matcher = new PathMatcher();
    private currentSearch: Signal<string>;
    private patterns = signal<string[]>([]);

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
            this.currentPath.value = window.location.pathname;
            this.currentSearch.value = window.location.search;
        });
    }

    navigate(path: string, replace = false): void {
        const [pathname, search = ''] = path.split('?');
        window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
        this.currentPath.value = pathname;
        this.currentSearch.value = search ? '?' + search : '';
    }

    back = () => window.history.back();
    forward = () => window.history.forward();

    registerPattern(pattern: string): void {
        if (!this.patterns.value.includes(pattern)) {
            this.patterns.value = [...this.patterns.value, pattern];
        }
    }

    match(pattern: string): ComputedSignal<RouteParams | null> {
        this.registerPattern(pattern);
        return computed(() => this.matcher.match(this.currentPath.value, pattern));
    }
}