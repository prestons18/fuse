/** @jsx h */
import { h, render } from "./fuse/dom";
import { Router, ApiRouter, RouteParams } from "./fuse/router";

const router = new Router();
const api = new ApiRouter();

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
                <a href="/about" onClick={(e: Event) => {
                    e.preventDefault();
                    router.navigate('/about');
                }}>Go to About</a>
                {' | '}
                <a href="/users/123" onClick={(e: Event) => {
                    e.preventDefault();
                    router.navigate('/users/123');
                }}>View User 123</a>
                {' | '}
                <a href="/posts/456" onClick={(e: Event) => {
                    e.preventDefault();
                    router.navigate('/posts/456');
                }}>View Post 456</a>
            </nav>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="page">
            <h1>About Page</h1>
            <p>This is a reactive routing example for Fuse.</p>
            <button onClick={() => router.navigate('/')}>Back to Home</button>
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
            <button onClick={() => router.navigate('/')}>Back to Home</button>
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
            <button onClick={() => router.navigate('/')}>Back to Home</button>
        </div>
    );
}

function NotFoundPage() {
    return (
        <div className="page">
            <h1>404 - Not Found</h1>
            <p>{() => `Page "${router.currentPath.value}" not found`}</p>
            <button onClick={() => router.navigate('/')}>Go Home</button>
        </div>
    );
}

// Router component that renders based on current path
function RouterView() {
    const homeMatch = router.match('/');
    const aboutMatch = router.match('/about');
    const userMatch = router.match('/users/:id');
    const postMatch = router.match('/posts/:postId');
    
    return (
        <div className="router-view">
            <div className="current-route">
                Current Route: {() => router.currentPath.value}
            </div>
            
            {() => {
                if (homeMatch.value && router.currentPath.value === '/') {
                    return HomePage();
                } else if (aboutMatch.value) {
                    return AboutPage();
                } else if (userMatch.value) {
                    return UserPage();
                } else if (postMatch.value) {
                    return PostPage();
                } else {
                    return NotFoundPage();
                }
            }}
        </div>
    );
}

// App with navigation
function App() {
    return (
        <div className="app">
            <header>
                <h1>Fuse Router Demo</h1>
                <nav className="main-nav">
                    <button onClick={() => router.navigate('/')}>Home</button>
                    <button onClick={() => router.navigate('/about')}>About</button>
                    <button onClick={() => router.navigate('/users/42')}>User 42</button>
                    <button onClick={() => router.navigate('/posts/999')}>Post 999</button>
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
