import { RouteParams } from "./types";
import { Router } from "./Router";

export interface RouteComponentProps {
    path: string;
    component: (params: RouteParams) => Node;
}

export interface LinkProps {
    href: string;
    children: Node | string;
    className?: string;
}

export function Route(props: RouteComponentProps, router: Router): Node {
    const params = router.match(props.path);
    return (() => params.value ? props.component(params.value) : document.createTextNode(''))() as Node;
}

export function Link(props: LinkProps, router: Router): HTMLAnchorElement {
    const a = document.createElement('a');
    a.href = props.href;
    if (props.className) a.className = props.className;
    if (typeof props.children === 'string') a.textContent = props.children;
    else a.appendChild(props.children);
    a.addEventListener('click', e => {
        e.preventDefault();
        router.navigate(props.href);
    });
    return a;
}