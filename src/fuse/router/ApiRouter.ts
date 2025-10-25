import { PathMatcher } from "./PathMatcher";
import { RouteParams } from "./types";

type Handler = (params: RouteParams, query: RouteParams) => any;

export class ApiRouter {
    private routes: Array<{ pattern: string; handler: Handler; method: string }> = [];
    private matcher = new PathMatcher();

    private register(method: string, pattern: string, handler: Handler) {
        this.routes.push({ pattern, handler, method });
    }

    handle(path: string, query: RouteParams = {}, method = 'GET'): any {
        for (const r of this.routes) {
            if (r.method === method) {
                const params = this.matcher.match(path, r.pattern);
                if (params) return r.handler(params, query);
            }
        }
        return null;
    }

    get = (p: string, h: Handler) => this.register('GET', p, h);
    post = (p: string, h: Handler) => this.register('POST', p, h);
    put = (p: string, h: Handler) => this.register('PUT', p, h);
    delete = (p: string, h: Handler) => this.register('DELETE', p, h);
    patch = (p: string, h: Handler) => this.register('PATCH', p, h);
}