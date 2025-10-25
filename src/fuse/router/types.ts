import { Signal, ComputedSignal } from "../reactivity";

export interface RouteParams {
    [key: string]: string;
}

export interface Route {
    path: string;
    component?: () => Node;
    handler?: (params: RouteParams) => any;
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
}

export interface ParsedPattern {
    segments: string[];
    paramNames: string[];
}