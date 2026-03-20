# WebJS

WebJS is a modern runtime-first JavaScript framework that lets you build complete web applications **using only JavaScript**—no HTML, no CSS, no `package.json`—and without the complexity of frameworks like React. It’s a brand-new way to think about web development.

---

## Why WebJS

Unlike traditional frameworks, WebJS:

- Lets you **create layouts, styles, and components purely in JS**.
- Eliminates build tools, virtual DOM, and boilerplate.
- Provides **all production-grade primitives** you need: state, stores, routing, resources, lifecycle hooks, error boundaries, hydration, keyed lists, and reactive effects.
- Keeps your apps **fast, predictable, and maintainable**.

WebJS is designed for developers who want **control without ceremony**.

---

## Core Primitives

### Reactive Effects
Automatically track dependencies for side effects and clean up when no longer needed—no hooks, no rules.

### Computed State
Keep derived values in sync automatically without memoization or templates.

### Batched Updates
Multiple state changes are applied in a single DOM flush to maximize performance.

### Selector Store
A built-in immutable store scales your state without Redux, Zustand, or Pinia.

### Async Resources
Load data with built-in support for status, errors, and cancellation—no ad hoc fetches or effects.

### Keyed List Diffing
Reorder lists without losing DOM identity, focus, or animations.

### URL Router
Handle path params and query strings out of the box, with no external routing library.

### Lifecycle Hooks
Mount/unmount hooks let components manage setup and cleanup with plain JS.

### Error Boundaries
Isolate failing widgets so the rest of the page continues working.

### Hydration
Attach the runtime to server-rendered HTML directly, no separate client shell required.

---

## Getting Started

Simply include the runtime in your project:

```html
<script src="please wait while i add the file"></script>
````

Then hydrate your app:

```javascript
const store = WebJS.store({ user: { name: 'Alice' }, items: [] });

WebJS.hydrate('#app', (root) => {
    const container = WebJS.container.vertical().spacing(16);
    root.append(container);

    WebJS.element.h1('Hello, WebJS!').addTo(container);
});
```

Everything—layout, styling, behavior—lives **in JavaScript**.

---

## Example: State & Reactivity

```javascript
const counter = WebJS.state(0);

WebJS.effect(() => console.log(`Counter: ${counter.value}`));

counter.value += 1; // triggers effect automatically
```

---

## Example: Components

```javascript
const Clicker = WebJS.component('Clicker', (props, ctx) => {
    const clicks = WebJS.state(0);

    return WebJS.element.button(() => `Clicked ${clicks.value} times`)
        .onClick(() => clicks.value += 1);
});
```

---

## Example: Async Resource

```javascript
const data = WebJS.resource(async () => {
    const response = await fetch('/api/items');
    return response.json();
}, { immediate: true });

WebJS.effect(() => {
    if (data.status.value === 'loaded') console.log(data.data.value);
});
```

---

## Example: Routing

```javascript
WebJS.router
    .route('/', showHome)
    .route('/about', showAbout)
    .route('/item/:id', showItem)
    .notFound(showNotFound)
    .start();
```

---

## Philosophy

WebJS is **runtime-first, minimal, and declarative in JS**. It removes the layers of compilation, virtual DOM, and template syntax while still giving you reactive state, routing, resources, and error boundaries. You **think in JS**, and the framework handles the DOM, layout, styling, and lifecycle automatically.

---

## License

MIT
