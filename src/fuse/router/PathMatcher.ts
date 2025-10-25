import { RouteParams, ParsedPattern } from "./types";

export class PathMatcher {
    private cache = new Map<string, ParsedPattern>();

    parse(pattern: string): ParsedPattern {
        if (this.cache.has(pattern)) return this.cache.get(pattern)!;
        const segments = pattern.split('/').filter(Boolean);
        const paramNames = segments.filter(s => s.startsWith(':')).map(s => s.slice(1));
        const parsed = { segments, paramNames };
        this.cache.set(pattern, parsed);
        return parsed;
    }

    match(path: string, pattern: string): RouteParams | null {
        const pathSegs = path.split('/').filter(Boolean);
        const { segments: patternSegs } = this.parse(pattern);
        if (pathSegs.length !== patternSegs.length) return null;
        const params: RouteParams = {};
        for (let i = 0; i < patternSegs.length; i++) {
            if (patternSegs[i].startsWith(':')) {
                params[patternSegs[i].slice(1)] = decodeURIComponent(pathSegs[i]);
            } else if (patternSegs[i] !== pathSegs[i]) return null;
        }
        return params;
    }

    parseQuery(search: string): RouteParams {
        const params: RouteParams = {};
        new URLSearchParams(search).forEach((v, k) => params[k] = v);
        return params;
    }
}