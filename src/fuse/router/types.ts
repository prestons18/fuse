import { Signal, ComputedSignal } from "../reactivity";

export interface RouteParams {
    [key: string]: string;
}

export interface NavigationContext {
    from: string;
    to: string;
    params: RouteParams;
}

export interface GuardResult {
    allow: boolean;
    redirect?: string;
}

export type RouteGuard = (context: NavigationContext) => GuardResult | boolean;
export type Middleware = (context: NavigationContext, next: () => void) => void;

export interface Route {
    path: string;
    component?: () => Node;
    handler?: (params: RouteParams) => any;
    guards?: RouteGuard[];
}

export interface IRouter {
    currentPath: Signal<string>;
    currentParams: ComputedSignal<RouteParams>;
    currentRouteParams: ComputedSignal<RouteParams>;
    navigate: (path: string) => void;
    back: () => void;
    forward: () => void;
    match: (pattern: string) => ComputedSignal<RouteParams | null>;
    registerPattern: (pattern: string) => void;
    addGuard: (pattern: string, guard: RouteGuard) => void;
    addMiddleware: (middleware: Middleware) => void;
}

export interface ParsedPattern {
    segments: string[];
    paramNames: string[];
}