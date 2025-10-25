/** @jsx h */
import { h, render, For } from "./fuse/dom";
import { signal, computed, onCleanup } from "./fuse/reactivity";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const todos = signal<Todo[]>([
    { id: 1, text: "Learn Fuse", completed: false },
    { id: 2, text: "Build something cool", completed: false }
  ]);
  
  const input = signal("");
  const filter = signal<"all" | "active" | "completed">("all");
  
  const filtered = computed(() => {
    const list = todos.get();
    const f = filter.get();
    if (f === "active") return list.filter(t => !t.completed);
    if (f === "completed") return list.filter(t => t.completed);
    return list;
  });
  
  const remaining = computed(() => 
    todos.get().filter(t => !t.completed).length
  );
  
  const addTodo = (e: Event) => {
    e.preventDefault();
    const text = input.get().trim();
    if (!text) return;
    
    todos.set([
      ...todos.get(),
      { id: Date.now(), text, completed: false }
    ]);
    input.set("");
  };
  
  const toggleTodo = (id: number) => {
    todos.set(
      todos.get().map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };
  
  const removeTodo = (id: number) => {
    todos.set(todos.get().filter(t => t.id !== id));
  };
  
  const clearCompleted = () => {
    todos.set(todos.get().filter(t => !t.completed));
  };
  
  return (
    <div className="app">
      <h1>Fuse Todo</h1>
      
      <form onSubmit={addTodo}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={() => input.get()}
          onInput={(e: Event) => input.set((e.target as HTMLInputElement).value)}
        />
        <button type="submit">Add</button>
      </form>
      
      <div className="filters">
        <button
          className={() => filter.get() === "all" ? "active" : ""}
          onClick={() => filter.set("all")}
        >
          All
        </button>
        <button
          className={() => filter.get() === "active" ? "active" : ""}
          onClick={() => filter.set("active")}
        >
          Active
        </button>
        <button
          className={() => filter.get() === "completed" ? "active" : ""}
          onClick={() => filter.set("completed")}
        >
          Completed
        </button>
      </div>
      
      <ul className="todo-list">
        {For({
          each: () => filtered.get(),
          children: [(todo: Todo) => {
            const li = (
              <li className={todo.completed ? "completed" : ""}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
                <button
                  className="remove"
                  onClick={() => removeTodo(todo.id)}
                >
                  x
                </button>
              </li>
            );
            return li as Node;
          }]
        })}
      </ul>
      
      <div className="footer">
        <span>
          {() => `${remaining.get()} item${remaining.get() === 1 ? "" : "s"} left`}
        </span>
        <button onClick={clearCompleted}>Clear completed</button>
      </div>
    </div>
  );
}

function CounterExample() {
  const count = signal(0);
  const doubled = computed(() => count.get() * 2);
  
  const interval = setInterval(() => count.set(count.get() + 1), 1000);
  onCleanup(() => clearInterval(interval));
  
  return (
    <div className="counter">
      <h2>Auto Counter</h2>
      <p>{() => `Count: ${count.get()}`}</p>
      <p>{() => `Doubled: ${doubled.get()}`}</p>
      <button onClick={() => count.set(0)}>Reset</button>
    </div>
  );
}

function ConditionalExample() {
  const show = signal(true);
  
  return (
    <div className="conditional">
      <h2>Conditional Rendering</h2>
      <button onClick={() => show.set(!show.get())}>Toggle</button>
      {() => show.get() ? <p>I'm visible!</p> : null}
    </div>
  );
}

const app = (
  <div>
    <TodoApp />
    <hr />
    <CounterExample />
    <hr />
    <ConditionalExample />
  </div>
);

render(app, document.getElementById("root")!);