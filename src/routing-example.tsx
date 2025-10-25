/** @jsx h */
import { h, render } from "./fuse/dom";
import { Router, ApiRouter, RouteParams, createLink } from "./fuse/router";

const router = new Router();
const api = new ApiRouter();
const Link = createLink(router);

// Register API routes
api.get('/api/users/:id', (params: RouteParams, query: RouteParams) => {
    console.log('GET /api/users/:id', params, query);
    return { user: { id: params.id, name: 'John Doe' } };
});

api.get('/api/posts/:postId/comments/:commentId', (params: RouteParams, query: RouteParams) => {
    console.log('GET /api/posts/:postId/comments/:commentId', params, query);
    return { 
        post: params.postId, 
        comment: params.commentId,
        filters: query 
    };
});

// Page Components
function HomePage() {
    return (
        <div className="page">
            <h1>Home Page</h1>
            <p>Welcome to Fuse Router!</p>
            <nav>
                {Link({ href: '/about', children: 'Go to About' })}
                {Link({ href: '/users/123', children: 'View User 123' })}
                {Link({ href: '/posts/456', children: 'View Post 456' })}
            </nav>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="page">
            <h1>About Page</h1>
            <p>This is a reactive routing example for Fuse.</p>
            {Link({ href: '/', children: 'Back to Home' })}
        </div>
    );
}

function UserPage() {
    const params = router.match('/users/:id');
    
    return (
        <div className="page">
            <h1>User Profile</h1>
            <p>{() => params.value ? `User ID: ${params.value.id}` : 'Loading...'}</p>
            <button onClick={() => {
                const result = api.handle(`/api/users/${params.value?.id}`, {});
                console.log('API Result:', result);
            }}>Fetch User Data</button>
            <br /><br />
            {Link({ href: '/', children: 'Back to Home' })}
        </div>
    );
}

function PostPage() {
    const params = router.match('/posts/:postId');
    
    return (
        <div className="page">
            <h1>Post Details</h1>
            <p>{() => params.value ? `Post ID: ${params.value.postId}` : 'Loading...'}</p>
            <button onClick={() => {
                const result = api.handle(
                    `/api/posts/${params.value?.postId}/comments/789`,
                    { sort: 'date', order: 'desc' }
                );
                console.log('API Result:', result);
            }}>Fetch Comments</button>
            <br /><br />
            {Link({ href: '/', children: 'Back to Home' })}
        </div>
    );
}

function NotFoundPage() {
    return (
        <div className="page">
            <h1>404 - Not Found</h1>
            <p>{() => `Page "${router.currentPath.value}" not found`}</p>
            {Link({ href: '/', children: 'Go Home' })}
        </div>
    );
}

const routes: Record<string, () => Node> = {
    "/": HomePage,
    "/about": AboutPage,
    "/users/:id": UserPage,
    "/posts/:postId": PostPage,
};

const routeMatches = Object.keys(routes).map(path => ({
    path,
    match: router.match(path),
    component: routes[path]
}));

function RouterView() {
    return (
        <div className="router-view">
            <div className="current-route">
                Current Route: {() => router.currentPath.value}
            </div>
            
            {() => {
                for (const route of routeMatches) {
                    if (route.match.value) return route.component();
                }
                return NotFoundPage();
            }}
        </div>
    );
}

function App() {
    return (
        <div className="app">
            <header>
                <h1>Fuse Router Demo</h1>
                <nav className="main-nav">
                    {Link({ href: '/', children: 'Home' })}
                    {Link({ href: '/about', children: 'About' })}
                    {Link({ href: '/users/42', children: 'User 42' })}
                    {Link({ href: '/posts/999', children: 'Post 999' })}
                    <button onClick={() => router.back()}>← Back</button>
                    <button onClick={() => router.forward()}>Forward →</button>
                </nav>
            </header>
            
            <main>
                <RouterView />
            </main>
            
            <footer>
                <p>Query Params: {() => JSON.stringify(router.currentParams.value)}</p>
            </footer>
        </div>
    );
}

router.navigate(window.location.pathname + window.location.search, true);

render(App(), document.getElementById("root")!);
