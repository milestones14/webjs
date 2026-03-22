// github.com/milestones14/WebJS

// You should use the minified version on a real website:
// <script src="https://raw.githack.com/milestones14/webjs/1.0.3/webjs_min.js"></script>

class WebJSError extends Error {
  constructor(message) {
    super(message);
    this.name = "WebJS Error";

    const prevErrPage = document.getElementById('err');
    if (prevErrPage) {
        if (window.webJSErrCount) {
            window.webJSErrCount += 1;
        } else {
            window.webJSErrCount = 1;
        }
        var currCount = window.webJSErrCount + 1;

        prevErrPage.children[1].innerText = `${new Intl.NumberFormat(navigator.language).format(currCount)} Application Errors`;
        prevErrPage.children[3].innerText = 'Please show these errors to the developer of this website:';

        const errorPre = document.createElement('pre');
        errorPre.style.background = 'white';
        errorPre.style.padding = '10px';
        errorPre.style.borderRadius = '10px';
        errorPre.textContent = message;
        prevErrPage.children[4].appendChild(errorPre);
        return;
    }

    const errPage = document.createElement('div');
    errPage.id = 'err';
    errPage.style.display = 'flex';
    errPage.style.flexDirection = 'column';
    errPage.style.justifyContent = 'center';
    errPage.style.alignItems = 'center';
    errPage.style.height = '100vh';
    errPage.style.width = '100vw';
    errPage.style.position = 'absolute';
    errPage.style.top = '0px';
    errPage.style.left = '0px';
    errPage.style.background = 'radial-gradient(circle at center top, rgba(251, 191, 36, 0.18), transparent 34%), radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.16), transparent 26%), linear-gradient(rgb(248, 251, 255) 0%, rgb(238, 245, 255) 48%, rgb(246, 247, 251) 100%)';
    document.body.appendChild(errPage);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 640 640");
    svg.setAttribute("width", "80");
    svg.setAttribute("height", "80");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "#ff3333");
    path.setAttribute("d", "M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z");
    svg.appendChild(path);
    errPage.appendChild(svg);

    const heading = document.createElement('h2');
    heading.style.color = 'rgb(255, 51, 51)';
    heading.textContent = 'Application Error';
    errPage.appendChild(heading);

    const hr = document.createElement('hr');
    hr.style.width = '340px';
    hr.style.borderWidth = '1px medium medium';
    hr.style.borderStyle = 'solid none none';
    hr.style.borderColor = 'rgb(179, 179, 179) currentcolor currentcolor';
    hr.style.margin = '15px 0px';
    errPage.appendChild(hr);

    const instruction = document.createElement('h4');
    instruction.textContent = 'Please show this error to the developer of this website:';
    errPage.appendChild(instruction);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.maxHeight = '232px';
    scrollWrapper.style.overflowY = 'auto';
    scrollWrapper.style.border = '1px solid #bebebe';
    scrollWrapper.style.padding = '0 10px';
    scrollWrapper.style.borderRadius = '10px';
    scrollWrapper.style.marginTop = '14px';

    const errorPre = document.createElement('pre');
    errorPre.style.background = 'white';
    errorPre.style.padding = '10px';
    errorPre.style.borderRadius = '10px';
    errorPre.textContent = message;

    scrollWrapper.appendChild(errorPre);
    errPage.appendChild(scrollWrapper);
  }
}

const WebJS = (function() {
    const mountQueue = [];
    const elementRegistry = new Map();
    const userIdMap = new Map();
    const stateRegistry = new Map();
    const routeTable = [];
    let notFoundHandler = null;
    let routerStarted = false;
    let defaultStylesInjected = false;
    let isDomReady = document.readyState !== 'loading';
    let stateIdCounter = 0;
    let currentObserver = null;
    let batchDepth = 0;
    let flushScheduled = false;
    const pendingObservers = new Set();
    const version = '1.0.3';
    const mainTarget = Symbol('WebJS_Main');

    function log(message, feat, mustPrint) {
        const logN = window.webjsLogging ? window.webjsLogging : 0;
        
        if (logN == 1 && !mustPrint) return; // 1 = errors only

        console.log(`WebJS${feat ? ' ' + feat : ''}: ${message}`);
    }

    function ensureHeadMeta() {
        if (!document.querySelector('meta[charset]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('charset', 'UTF-8');
            document.head.appendChild(meta);
        }
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
        }
    }

    function injectDefaultStyles() {
        if (defaultStylesInjected) return;
        defaultStylesInjected = true;
        ensureHeadMeta();

        const style = document.createElement('style');
        style.id = 'webjs-default-styles';
        style.textContent = `
            :root {
                --webjs-font-sans: "Space Grotesk", "Avenir Next", "Helvetica Neue", Arial, sans-serif;
                --webjs-font-serif: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
                --webjs-font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
                --webjs-text: #10233f;
                --webjs-muted: #51627d;
                --webjs-surface: rgba(255, 255, 255, 0.82);
                --webjs-surface-strong: #ffffff;
                --webjs-border: rgba(16, 35, 63, 0.12);
                --webjs-accent: #175cd3;
                --webjs-accent-strong: #0d3f99;
                --webjs-danger: #b42318;
                --webjs-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
            }

            html {
                min-height: 100%;
                background:
                    radial-gradient(circle at top, rgba(251, 191, 36, 0.18), transparent 34%),
                    radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.16), transparent 26%),
                    linear-gradient(180deg, #f8fbff 0%, #eef5ff 48%, #f6f7fb 100%);
            }

            body {
                min-height: 100vh;
                margin: 0;
                color: var(--webjs-text);
                font-family: var(--webjs-font-sans);
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
            }

            * {
                box-sizing: border-box;
                user-select: none;
            }

            :where(h1, h2, h3, h4, h5, h6, p, ul, ol) {
                margin: 0;
            }

            :where(h1, h2, h3, h4, h5, h6) {
                letter-spacing: -0.04em;
                line-height: 1.02;
            }

            :where(h1) { font-size: clamp(2.8rem, 7vw, 5.2rem); }
            :where(h2) { font-size: clamp(2rem, 4vw, 3rem); }
            :where(h3) { font-size: clamp(1.35rem, 3vw, 1.85rem); }

            :where(p, span, label, li, a, button, input, textarea, select) {
                font-size: 1rem;
                line-height: 1.55;
            }

            :where(button, input, textarea, select) {
                border-radius: 18px;
                border: 1px solid var(--webjs-border);
                background: var(--webjs-surface);
                box-shadow: var(--webjs-shadow);
                color: var(--webjs-text);
                font: inherit;
            }

            :where(button) {
                cursor: pointer;
                padding: 12px 18px;
                transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;
            }

            :where(button:hover) {
                /*transform: translateY(-1px);*/
            }

            :where(input, textarea, select) {
                padding: 12px 14px;
                min-width: 220px;
            }

            :where(a) {
                color: var(--webjs-accent);
                text-decoration: none;
            }
        `;
        document.head.appendChild(style);
    }

    injectDefaultStyles();

    document.addEventListener('DOMContentLoaded', () => {
        isDomReady = true;
        mountQueue.splice(0).forEach((task) => task());
    });

    const formatUnit = (value) => typeof value === 'number' ? `${value}px` : value;
    const stateTokenPattern = /__WEBJS_STATE_\d+__/g;

    function createElementId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
            return `webjs-${globalThis.crypto.randomUUID().replaceAll('-', '')}`;
        }
        return `webjs-${Math.random().toString(16).slice(2)}`;
    }

    function queueObserver(observer) {
        if (!observer || observer.disposed) return;
        pendingObservers.add(observer);
        if (batchDepth > 0 || flushScheduled) return;
        flushScheduled = true;
        queueMicrotask(flushObservers);
    }

    function flushObservers() {
        flushScheduled = false;
        const queue = Array.from(pendingObservers);
        pendingObservers.clear();
        queue.forEach((observer) => observer.run());
        if (pendingObservers.size > 0) {
            flushScheduled = true;
            queueMicrotask(flushObservers);
        }
    }

    function cleanupObserver(observer) {
        observer.dependencies.forEach((state) => state._observers.delete(observer));
        observer.dependencies.clear();
        if (typeof observer.cleanupFn === 'function') {
            const fn = observer.cleanupFn;
            observer.cleanupFn = null;
            fn();
        }
    }

    function createObserver(callback, options = {}) {
        const observer = {
            callback,
            cleanupFn: null,
            dependencies: new Set(),
            disposed: false,
            run() {
                if (observer.disposed) return;
                cleanupObserver(observer);
                const previous = currentObserver;
                currentObserver = observer;
                try {
                    const cleanup = callback();
                    observer.cleanupFn = typeof cleanup === 'function' ? cleanup : null;
                } finally {
                    currentObserver = previous;
                }
            },
            dispose() {
                observer.disposed = true;
                pendingObservers.delete(observer);
                cleanupObserver(observer);
            }
        };
        if (!options.lazy) observer.run();
        return observer;
    }

    function batch(work) {
        batchDepth += 1;
        try {
            return work();
        } finally {
            batchDepth -= 1;
            if (batchDepth === 0 && pendingObservers.size > 0) flushObservers();
        }
    }

    function trackState(state) {
        if (!currentObserver) return;
        state._observers.add(currentObserver);
        currentObserver.dependencies.add(state);
    }

    function notifyState(state) {
        state._listeners.forEach((listener) => listener(state._value));
        state._observers.forEach((observer) => queueObserver(observer));
    }

    function isWebJSState(value) {
        return Boolean(value && value.__isWebJSState === true);
    }

    function createState(initialValue) {
        const token = `__WEBJS_STATE_${++stateIdCounter}__`;
        const state = {
            _value: initialValue,
            _listeners: new Set(),
            _observers: new Set(),
            __isWebJSState: true,
            get value() {
                trackState(state);
                return state._value;
            },
            set value(nextValue) {
                if (Object.is(state._value, nextValue)) return;
                state._value = nextValue;
                notifyState(state);
            },
            subscribe(listener, options = { immediate: true }) {
                state._listeners.add(listener);
                if (options.immediate !== false) listener(state._value);
                return () => state._listeners.delete(listener);
            },
            peek() {
                return state._value;
            }
        };
        state.toString = () => token;
        state.valueOf = () => token;
        state[Symbol.toPrimitive] = () => token;
        stateRegistry.set(token, state);
        return state;
    }

    function computed(getter) {
        const result = createState(undefined);
        const observer = createObserver(() => {
            result.value = getter();
        });
        result.dispose = () => observer.dispose();
        return result;
    }

    function effect(callback) {
        const observer = createObserver(callback);
        return () => observer.dispose();
    }

    function getStateTokens(text) {
        if (typeof text !== 'string') return [];
        return [...new Set(text.match(stateTokenPattern) || [])];
    }

    function resolveReactiveText(text) {
        if (typeof text !== 'string') return text;
        return text.replace(stateTokenPattern, (token) => {
            const state = stateRegistry.get(token);
            return state ? String(state.value) : '';
        });
    }

    function deepClone(value) {
        if (Array.isArray(value)) return value.map(deepClone);
        if (value && typeof value === 'object') {
            const clone = {};
            Object.keys(value).forEach((key) => {
                clone[key] = deepClone(value[key]);
            });
            return clone;
        }
        return value;
    }

    function getByPath(source, path) {
        if (!path) return source;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        return keys.reduce((current, key) => current == null ? undefined : current[key], source);
    }

    function setByPath(source, path, value) {
        const keys = Array.isArray(path) ? path : String(path).split('.');
        const root = Array.isArray(source) ? source.slice() : { ...source };
        let cursor = root;
        let original = source;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                cursor[key] = typeof value === 'function' ? value(getByPath(source, path)) : value;
                return;
            }
            const originalNext = original && original[key];
            const next = Array.isArray(originalNext) ? originalNext.slice() : { ...(originalNext || {}) };
            cursor[key] = next;
            cursor = next;
            original = originalNext;
        });
        return root;
    }

    function createStore(initialValue) {
        const root = createState(deepClone(initialValue));
        return {
            __isWebJSStore: true,
            state: root,
            get(path) {
                return getByPath(root.value, path);
            },
            set(path, value) {
                root.value = setByPath(root.value, path, value);
                return this;
            },
            patch(partial) {
                root.value = { ...root.value, ...partial };
                return this;
            },
            update(updater) {
                root.value = updater(deepClone(root.value));
                return this;
            },
            select(selector) {
                return computed(() => selector(root.value));
            },
            subscribe(listener, options) {
                return root.subscribe(listener, options);
            }
        };
    }

    function createResource(loader, options = {}) {
        const status = createState(options.immediate === false ? 'idle' : 'loading');
        const data = createState(options.initialData ?? null);
        const error = createState(null);
        let currentRequest = 0;
        let controller = null;
        let lastParams = options.initialParams;

        const load = async (params = lastParams) => {
            lastParams = params;
            const requestId = ++currentRequest;
            if (controller) controller.abort();
            controller = typeof AbortController === 'function' ? new AbortController() : null;
            status.value = 'loading';
            error.value = null;
            try {
                const result = await loader(params, { signal: controller ? controller.signal : null });
                if (requestId !== currentRequest) return data.value;
                data.value = result;
                status.value = 'success';
                return result;
            } catch (err) {
                if (controller && err && err.name === 'AbortError') return data.value;
                if (requestId !== currentRequest) return data.value;
                error.value = err;
                status.value = 'error';
                return null;
            }
        };

        const cancel = () => {
            if (controller) controller.abort();
            status.value = 'idle';
        };

        if (options.immediate !== false) load(options.initialParams);

        return {
            status,
            data,
            error,
            isLoading: computed(() => status.value === 'loading'),
            hasValue: computed(() => data.value !== null && data.value !== undefined),
            load,
            reload() {
                return load(lastParams);
            },
            cancel
        };
    }

    function compileRoute(path) {
        const keys = [];
        const pattern = path
            .replace(/\/+$/, '')
            .replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
                keys.push(key);
                return '([^/]+)';
            });
        return {
            path,
            keys,
            regex: new RegExp(`^${pattern || '/'}$`)
        };
    }

    const currentRoute = createState({
        path: window.location.pathname,
        query: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
        params: {},
        href: window.location.href
    });

    function resolveRoute(url = `${window.location.pathname}${window.location.search}`) {
        const parsed = new URL(url, window.location.origin);
        const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
        const query = Object.fromEntries(parsed.searchParams.entries());
        for (const route of routeTable) {
            const match = pathname.match(route.regex);
            if (!match) continue;
            const params = {};
            route.keys.forEach((key, index) => {
                params[key] = decodeURIComponent(match[index + 1]);
            });
            const context = { path: pathname, query, params, href: parsed.href };
            currentRoute.value = context;
            route.handler(context);
            return context;
        }
        const miss = { path: pathname, query, params: {}, href: parsed.href };
        currentRoute.value = miss;
        if (typeof notFoundHandler === 'function') notFoundHandler(miss);
        return miss;
    }

    function startRouter() {
        if (routerStarted) return;
        routerStarted = true;
        window.addEventListener('popstate', () => resolveRoute());
        document.addEventListener('click', (event) => {
            const anchor = event.target.closest('a[data-webjs-link]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('http') || anchor.target === '_blank') return;
            event.preventDefault();
            navigate(href);
        });
    }

    function navigate(path, options = {}) {
        if (!options.replace) {
            window.history.pushState({}, '', path);
        } else {
            window.history.replaceState({}, '', path);
        }
        return resolveRoute(path);
    }

    class ComponentScope {
        constructor(name) {
            this.name = name;
            this.mountCallbacks = [];
            this.unmountCallbacks = [];
            this.cleanups = [];
            this.mounted = false;
        }

        mount() {
            if (this.mounted) return;
            this.mounted = true;
            this.mountCallbacks.forEach((fn) => fn());
        }

        dispose() {
            this.unmountCallbacks.forEach((fn) => fn());
            this.cleanups.splice(0).forEach((fn) => fn());
            this.mounted = false;
        }
    }

    function generateSmoothPath(w, h, r, s) {
        // r = radius, s = smoothing
        r = Math.min(r, w / 2, h / 2);
        
        // The 'm' value controls the "straightness" of the transition
        const m = Math.min(w / 2, h / 2, r * (1 + s));

        // Points for a single corner (top-right)
        const getCorner = (ox, oy, rotate) => {
            const pts = [];
            const steps = 20; // smoothness of the corner itself
            for (let i = 0; i <= steps; i++) {
            const theta = (i * Math.PI / 2) / steps + rotate;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            
            // Superellipse formula
            const x = ox + Math.pow(Math.abs(cosT), 2 / (2 + s * 2)) * m * Math.sign(cosT);
            const y = oy + Math.pow(Math.abs(sinT), 2 / (2 + s * 2)) * m * Math.sign(sinT);
            pts.push(`${x},${y}`);
            }
            return pts;
        };

        // Build the path by connecting 4 curved corners with straight lines
        const tr = getCorner(w - m, m, -Math.PI / 2);
        const br = getCorner(w - m, h - m, 0);
        const bl = getCorner(m, h - m, Math.PI / 2);
        const tl = getCorner(m, m, Math.PI);

        return `M ${tl.join(' L ')} L ${tr.join(' L ')} L ${br.join(' L ')} L ${bl.join(' L ')} Z`;
    }

    function doSmoothElems() {
        const update = (el) => {
            if (!el.hasAttribute('nosmoothing')) {
                const { width: w, height: h } = el.getBoundingClientRect();
                const r = parseFloat(el.dataset.radius) || 40;
                const s = parseFloat(el.dataset.smoothing) || 0.7;
                
                const path = generateSmoothPath(w, h, r, s);
                el.style.clipPath = `path('${path}')`;
            } else {
                el.style.removeProperty('clipPath');
            }
        };

        const ro = new ResizeObserver(entries => {
            for (let entry of entries) update(entry.target);
        });

        document.querySelectorAll('[id^="webjs-"]').forEach(el => {
            if (!el.hasAttribute('nosmoothing')) {
                ro.observe(el);
                update(el);
            } else {
                el.style.removeProperty('clipPath');
            }
        });
    }

    function applySmoothingToElement(el) {
        if (!el || el.hasAttribute('nosmoothing')) {
            el.style.removeProperty('clip-path');
            return;
        }

        const { width: w, height: h } = el.getBoundingClientRect();
        const r = parseFloat(el.dataset.radius) || 40;
        const s = parseFloat(el.dataset.smoothing) || 0.7;
        
        const path = generateSmoothPath(w, h, r, s);
        el.style.clipPath = `path('${path}')`;
    }

    class WebJSElement {
        constructor(tag, existingNode = null) {
            this.node = existingNode || document.createElement(tag);
            this._tag = tag;
            this._id = null;
            this._oldDisplay = '';
            this._layoutType = null;
            this._contentTemplate = null;
            this._contentSubscriptions = [];
            this._cleanups = [];
            this._children = [];
            this._keyedCache = new Map();
            this._listUnsubscribe = null;
            this._parent = null;
            this._scope = null;
            this._mounted = false;

            if (existingNode && this.node.id) {
                this._id = this.node.id;
                elementRegistry.set(this._id, this);
            } else {
                const domId = createElementId();
                this._id = domId;
                this.node.id = domId;
                elementRegistry.set(domId, this);
            }
            if (tag === 'button') this.node.style.cursor = 'pointer';

            log(`${this.node.id} constructed.`, 'Elements')

            doSmoothElems();
        }

        static wrapNode(node) {
            return new WebJSElement(node.tagName.toLowerCase(), node);
        }

        useScope(scope) {
            this._scope = scope;
            return this;
        }

        own(cleanup) {
            if (typeof cleanup === 'function') this._cleanups.push(cleanup);
            return this;
        }

        append(child) {
            if (!(child instanceof WebJSElement)) return this;
            child._parent = this;
            this._children.push(child);
            this.node.appendChild(child.node);
            if (this._layoutType === 'stack') child.node.style.gridArea = '1 / 1';
            child._notifyMounted();
            return this;
        }

        useSmoothing(value) {
            if (value) {
                this.node.removeAttribute('nosmoothing');

                const ro = new ResizeObserver(() => applySmoothingToElement(this.node));
                ro.observe(this.node);
                applySmoothingToElement(this.node);

                log(`Smoothed ${this.node.id}.`, 'Smoothing');
            } else {
                this.node.setAttribute('nosmoothing', '');

                this.node.style.removeProperty('clip-path');

                log(`Stopped smoothing for ${this.node.id}.`, 'Smoothing');
            }

            return this;
        }

        addTo(parent) {
            if (parent === mainTarget) {
                const mount = () => {
                    document.body.appendChild(this.node);
                    this._notifyMounted();
                };
                if (isDomReady) mount();
                else mountQueue.push(mount);
                return this;
            }
            if (parent instanceof WebJSElement) parent.append(this);
            return this;
        }

        mountTo(target) {
            const node = typeof target === 'string' ? document.querySelector(target) : target;
            if (!node) throw new WebJSError(`Mount target not found: ${target}`);
            node.appendChild(this.node);
            this._notifyMounted();
            return this;
        }

        _notifyMounted() {
            function hasDirectTextOnly(el) {
                // Check if every child is a text node
                return el.childNodes.length > 0 && 
                        Array.from(el.childNodes).every(node => node.nodeType === Node.TEXT_NODE) ||
                        el.tagName.toLowerCase() == 'span';
            }

            if (this._mounted || !this.node.isConnected) return;
            this._mounted = true;

            // Initialize smoothing now that the element is in the DOM
            if (!this.node.hasAttribute('nosmoothing') && (this.node.tagName.toLowerCase() === "button" || !hasDirectTextOnly(this.node))) {
                const ro = new ResizeObserver(() => applySmoothingToElement(this.node));
                ro.observe(this.node);
                applySmoothingToElement(this.node);
                this.own(() => ro.disconnect()); // Clean up observer on remove()

                log(`Smoothed ${this.node.id}.`, 'Smoothing');
            } else {
                log(`Didn't smooth ${this.node.id}.`, 'Smoothing');
                this.node.setAttribute('nosmoothing', '');
            }

            if (this._scope) this._scope.mount();
            this._children.forEach((child) => child._notifyMounted());

            log(`${this.node.id} mounted.`, 'Elements')
        }

        _clearContentSubscriptions() {
            this._contentSubscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
        }

        _renderBoundContent() {
            if (this._contentTemplate === null) return;
            this.node.innerText = resolveReactiveText(this._contentTemplate);
        }

        _bindTemplateContent(text) {
            this._clearContentSubscriptions();
            this._contentTemplate = text;
            this._contentSubscriptions = getStateTokens(text).map((token) => {
                const state = stateRegistry.get(token);
                return state ? state.subscribe(() => this._renderBoundContent()) : () => {};
            });
            this._renderBoundContent();
        }

        _bindStateContent(state) {
            this._clearContentSubscriptions();
            this._contentTemplate = null;
            this._contentSubscriptions = [
                state.subscribe((value) => {
                    this.node.innerText = value == null ? '' : String(value);
                })
            ];
        }

        _bindDynamicValue(source, apply) {
            const state = typeof source === 'function' ? computed(source) : source;
            if (!isWebJSState(state)) {
                apply(source);
                return this;
            }
            const unsubscribe = state.subscribe((value) => apply(value));
            this.own(unsubscribe);
            if (typeof source === 'function' && typeof state.dispose === 'function') {
                this.own(() => state.dispose());
            }
            return this;
        }

        clear() {
            this._children.splice(0).forEach((child) => child.remove());
            this._keyedCache.clear();
            if (this._listUnsubscribe) {
                this._listUnsubscribe();
                this._listUnsubscribe = null;
            }
            this.node.replaceChildren();
            return this;
        }

        remove() {
            this._clearContentSubscriptions();
            if (this._listUnsubscribe) this._listUnsubscribe();
            this._children.splice(0).forEach((child) => child.remove());
            this._cleanups.splice(0).forEach((cleanup) => cleanup());
            if (this._scope) this._scope.dispose();
            if (this._id) {
                elementRegistry.delete(this._id);
                for (const [k, v] of userIdMap.entries()) {
                    if (v === this._id) userIdMap.delete(k);
                }
            }
            if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
            this._mounted = false;
            return this;
        }

        get content() {
            return this.node.innerText;
        }

        set content(value) {
            if (isWebJSState(value)) {
                this._bindStateContent(value);
                return;
            }
            if (typeof value === 'function') {
                this._bindStateContent(computed(value));
                return;
            }
            if (typeof value === 'string' && getStateTokens(value).length > 0) {
                this._bindTemplateContent(value);
                return;
            }
            this._clearContentSubscriptions();
            this._contentTemplate = null;
            this.node.innerText = value == null ? '' : String(value);
        }

        get value() {
            return this.node.value;
        }

        set value(nextValue) {
            this.node.value = nextValue;
        }

        text(value) {
            this.content = value;
            return this;
        }

        html(value) {
            if (isWebJSState(value) || typeof value === 'function') {
                return this._bindDynamicValue(value, (next) => {
                    this.node.innerHTML = next == null ? '' : String(next);
                });
            }
            this.node.innerHTML = value == null ? '' : String(value);
            return this;
        }

        attr(key, value) {
            if (isWebJSState(value) || typeof value === 'function') {
                return this._bindDynamicValue(value, (next) => {
                    if (next === false || next == null) this.node.removeAttribute(key);
                    else this.node.setAttribute(key, String(next));
                });
            }
            if (value === false || value == null) this.node.removeAttribute(key);
            else this.node.setAttribute(key, String(value));
            return this;
        }

        prop(key, value) {
            if (isWebJSState(value) || typeof value === 'function') {
                return this._bindDynamicValue(value, (next) => {
                    this.node[key] = next;
                });
            }
            this.node[key] = value;
            return this;
        }

        id(value) {
            const userId = String(value);
            if (userIdMap.has(userId)) {
                throw new WebJSError(`WebJS: Attempted to assign duplicate id '${userId}'. This id is already in use.`);
            }
            // remove previous DOM id registration and any user mappings that pointed to it
            if (this._id) {
                elementRegistry.delete(this._id);
                for (const [k, v] of userIdMap.entries()) {
                    if (v === this._id) userIdMap.delete(k);
                }
            }
            // always generate a random DOM id for the element
            const domId = createElementId();
            this._id = domId;
            this.node.id = domId;
            elementRegistry.set(domId, this);
            // map the user-defined id to the generated DOM id so .fromId(...) still works
            userIdMap.set(userId, domId);
            return this;
        }

        className(value) {
            if (isWebJSState(value) || typeof value === 'function') {
                return this._bindDynamicValue(value, (next) => {
                    this.node.className = next || '';
                });
            }
            this.node.className = value || '';
            return this;
        }

        data(key, value) {
            return this.attr(`data-${key}`, value);
        }

        css(styles) {
            Object.assign(this.node.style, styles);
            return this;
        }

        style(name, value) {
            return this._bindDynamicValue(value, (next) => {
                const val = next == null ? '' : String(next);
                // Use setProperty so both 'userSelect' and '-webkit-user-select' work
                if (name.includes('-') || name.startsWith('webkit')) {
                    this.node.style.setProperty(name, val);
                } else {
                    this.node.style[name] = val;
                }
            });
        }

        _setStyleValue(name, value, useUnit = false) {
            return this._bindDynamicValue(value, (next) => {
                this.node.style[name] = next == null ? '' : String(useUnit ? formatUnit(next) : next);
            });
        }

        _setDimension(name, value) {
            return this._setStyleValue(name, value, true);
        }

        background(color) { return this.style('background', color); }
        foreground(color) { return this.style('color', color); }
        font(value) {
            if (typeof value === 'string' && /\d/.test(value)) return this.style('font', value);
            return this.style('fontFamily', value);
        }
        weight(value) { return this.style('fontWeight', value); }
        padding(value) { return this._applyBoxModel('padding', value); }
        margin(value) { return this._applyBoxModel('margin', value); }

        width(value) { return this._setDimension('width', value); }
        height(value) { return this._setDimension('height', value); }
        minWidth(value) { return this._setDimension('minWidth', value); }
        maxWidth(value) { return this._setDimension('maxWidth', value); }
        minHeight(value) { return this._setDimension('minHeight', value); }
        maxHeight(value) { return this._setDimension('maxHeight', value); }
        boxSizing(value) { return this.style('boxSizing', value); }

        visibility(value) { return this.style('visibility', value); }
        overflow(value) { return this.style('overflow', value); }
        overflowX(value) { return this.style('overflowX', value); }
        overflowY(value) { return this.style('overflowY', value); }
        position(value) { return this.style('position', value); }
        top(value) { return this._setDimension('top', value); }
        right(value) { return this._setDimension('right', value); }
        bottom(value) { return this._setDimension('bottom', value); }
        left(value) { return this._setDimension('left', value); }

        marginTop(value) { return this._setDimension('marginTop', value); }
        marginRight(value) { return this._setDimension('marginRight', value); }
        marginBottom(value) { return this._setDimension('marginBottom', value); }
        marginLeft(value) { return this._setDimension('marginLeft', value); }
        paddingTop(value) { return this._setDimension('paddingTop', value); }
        paddingRight(value) { return this._setDimension('paddingRight', value); }
        paddingBottom(value) { return this._setDimension('paddingBottom', value); }
        paddingLeft(value) { return this._setDimension('paddingLeft', value); }
        gap(value) { return this._setDimension('gap', value); }
        rowGap(value) { return this._setDimension('rowGap', value); }
        columnGap(value) { return this._setDimension('columnGap', value); }

        flexGrow(value) { return this.style('flexGrow', value); }
        flexShrink(value) { return this.style('flexShrink', value); }
        flexBasis(value) { return this._setDimension('flexBasis', value); }
        flexDirection(value) { return this.style('flexDirection', value); }
        flexWrap(value) { return this.style('flexWrap', value); }
        justifyContent(value) { return this.style('justifyContent', value); }
        justifyItems(value) { return this.style('justifyItems', value); }
        justifySelf(value) { return this.style('justifySelf', value); }
        alignItems(value) { return this.style('alignItems', value); }
        alignContent(value) { return this.style('alignContent', value); }
        alignSelf(value) { return this.style('alignSelf', value); }
        placeItems(value) { return this.style('placeItems', value); }
        placeContent(value) { return this.style('placeContent', value); }
        placeSelf(value) { return this.style('placeSelf', value); }

        gridTemplateColumns(value) { return this.style('gridTemplateColumns', value); }
        gridTemplateRows(value) { return this.style('gridTemplateRows', value); }
        gridTemplateAreas(value) { return this.style('gridTemplateAreas', value); }
        gridAutoColumns(value) { return this.style('gridAutoColumns', value); }
        gridAutoRows(value) { return this.style('gridAutoRows', value); }
        gridAutoFlow(value) { return this.style('gridAutoFlow', value); }
        gridColumn(value) { return this.style('gridColumn', value); }
        gridColumnStart(value) { return this.style('gridColumnStart', value); }
        gridColumnEnd(value) { return this.style('gridColumnEnd', value); }
        gridRow(value) { return this.style('gridRow', value); }
        gridRowStart(value) { return this.style('gridRowStart', value); }
        gridRowEnd(value) { return this.style('gridRowEnd', value); }
        gridArea(value) { return this.style('gridArea', value); }
        gridGap(value) { return this._setDimension('gridGap', value); }

        fontSize(value) { return this._setDimension('fontSize', value); }
        fontWeight(value) { return this.style('fontWeight', value); }
        fontFamily(value) { return this.style('fontFamily', value); }
        fontStyle(value) { return this.style('fontStyle', value); }
        lineHeight(value) { return this.style('lineHeight', value); }
        letterSpacing(value) { return this._setDimension('letterSpacing', value); }
        textAlign(value) { return this.style('textAlign', value); }
        textDecoration(value) { return this.style('textDecoration', value); }
        textTransform(value) { return this.style('textTransform', value); }
        textOverflow(value) { return this.style('textOverflow', value); }
        textWrap(value) { return this.style('textWrap', value); }
        whiteSpace(value) { return this.style('whiteSpace', value); }
        wordBreak(value) { return this.style('wordBreak', value); }
        wordSpacing(value) { return this._setDimension('wordSpacing', value); }

        color(value) { return this.style('color', value); }
        opacity(value) { return this.style('opacity', value); }
        backgroundColor(value) { return this.style('backgroundColor', value); }
        backgroundImage(value) { return this.style('backgroundImage', value); }
        backgroundSize(value) { return this.style('backgroundSize', value); }
        backgroundPosition(value) { return this.style('backgroundPosition', value); }
        backgroundRepeat(value) { return this.style('backgroundRepeat', value); }
        backgroundAttachment(value) { return this.style('backgroundAttachment', value); }
        backgroundClip(value) { return this.style('backgroundClip', value); }
        backgroundOrigin(value) { return this.style('backgroundOrigin', value); }

        borderWidth(value) { return this._setDimension('borderWidth', value); }
        borderStyle(value) { return this.style('borderStyle', value); }
        borderColor(value) { return this.style('borderColor', value); }
        borderRadius(value) { return this._setDimension('borderRadius', value); }
        borderTop(value) { return this.style('borderTop', value); }
        borderRight(value) { return this.style('borderRight', value); }
        borderBottom(value) { return this.style('borderBottom', value); }
        borderLeft(value) { return this.style('borderLeft', value); }
        borderTopLeftRadius(value) { return this._setDimension('borderTopLeftRadius', value); }
        borderTopRightRadius(value) { return this._setDimension('borderTopRightRadius', value); }
        borderBottomLeftRadius(value) { return this._setDimension('borderBottomLeftRadius', value); }
        borderBottomRightRadius(value) { return this._setDimension('borderBottomRightRadius', value); }
        outline(value) { return this.style('outline', value); }
        outlineOffset(value) { return this._setDimension('outlineOffset', value); }

        boxShadow(value) { return this.style('boxShadow', value); }
        textShadow(value) { return this.style('textShadow', value); }
        filter(value) { return this.style('filter', value); }
        backdropFilter(value) { return this.style('backdropFilter', value); }

        transform(value) { return this.style('transform', value); }
        transformOrigin(value) { return this.style('transformOrigin', value); }
        transition(value) { return this.style('transition', value); }
        transitionDuration(value) { return this.style('transitionDuration', value); }
        transitionTimingFunction(value) { return this.style('transitionTimingFunction', value); }
        transitionDelay(value) { return this.style('transitionDelay', value); }
        animation(value) { return this.style('animation', value); }

        cursor(value) { return this.style('cursor', value); }
        userSelect(value) { return this.style('userSelect', value); }
        pointerEvents(value) { return this.style('pointerEvents', value); }
        objectFit(value) { return this.style('objectFit', value); }
        objectPosition(value) { return this.style('objectPosition', value); }
        aspectRatio(value) { return this.style('aspectRatio', value); }
        resize(value) { return this.style('resize', value); }
        isolation(value) { return this.style('isolation', value); }

        selectable(value) {
            return this._bindDynamicValue(value, (next) => {
                const mode = next ? 'text' : 'none';
                this.style('userSelect', mode);
                this.style('webkitUserSelect', mode);
            });
        }

        _applyBoxModel(type, value) {
            if (typeof value !== 'object' || value == null) {
                this.node.style[type] = formatUnit(value);
                return this;
            }
            if (value.top !== undefined) this.node.style[`${type}Top`] = formatUnit(value.top);
            if (value.right !== undefined) this.node.style[`${type}Right`] = formatUnit(value.right);
            if (value.bottom !== undefined) this.node.style[`${type}Bottom`] = formatUnit(value.bottom);
            if (value.left !== undefined) this.node.style[`${type}Left`] = formatUnit(value.left);
            return this;
        }

        cornerRadius(value) {
            if (typeof value !== 'object' || value == null) {
                this.node.style.borderRadius = formatUnit(value);
                return this;
            }
            if (value.topLeft !== undefined) this.node.style.borderTopLeftRadius = formatUnit(value.topLeft);
            if (value.topRight !== undefined) this.node.style.borderTopRightRadius = formatUnit(value.topRight);
            if (value.bottomLeft !== undefined) this.node.style.borderBottomLeftRadius = formatUnit(value.bottomLeft);
            if (value.bottomRight !== undefined) this.node.style.borderBottomRightRadius = formatUnit(value.bottomRight);
            return this;
        }

        border(value) {
            if (!value) {
                this.node.style.border = 'none';
                return this;
            }
            if (typeof value !== 'object') {
                this.node.style.border = String(value);
                return this;
            }
            this.node.style.borderWidth = formatUnit(value.width ?? 1);
            this.node.style.borderStyle = value.type || 'solid';
            this.node.style.borderColor = value.color || 'currentColor';
            return this;
        }

        display(value) {
            return this.style('display', value);
        }

        visible(condition) {
            return this._bindDynamicValue(condition, (next) => {
                if (next) {
                    this.node.style.display = this._oldDisplay || '';
                } else {
                    this._oldDisplay = this.node.style.display !== 'none' ? this.node.style.display : '';
                    this.node.style.display = 'none';
                }
            });
        }

        disabled(value = true) {
            return this.prop('disabled', value);
        }

        tooltip(text) { return this.attr('title', text); }
        aria(label, role = 'generic') { return this.attr('aria-label', label).attr('role', role); }
        flex(value = 'row', justify = 'flex-start', align = 'stretch') {
            if (arguments.length <= 1) return this.style('flex', value);
            return this.css({ display: 'flex', flexDirection: value, justifyContent: justify, alignItems: align });
        }
        spacing(value) { return this.gap(value); }
        zIndex(value) {
            this.node.style.zIndex = String(value);
            if (!this.node.style.position) this.node.style.position = 'relative';
            return this;
        }

        bindContent(source) {
            this.content = source;
            return this;
        }

        bindValue(state) {
            if (!isWebJSState(state)) return this;
            this.value = state.value ?? '';
            this.onValueChanged((event) => {
                state.value = event.target.value;
            });
            this.own(state.subscribe((value) => {
                if (this.node.value !== value) this.node.value = value ?? '';
            }, { immediate: false }));
            return this;
        }

        renderList(items, renderItem) {
            const apply = (list) => {
                this.clear();
                list.forEach((item, index) => {
                    const child = renderItem(item, index);
                    if (child instanceof WebJSElement) this.append(child);
                });
            };
            if (isWebJSState(items)) {
                this._listUnsubscribe = items.subscribe(apply);
            } else {
                apply(items);
            }
            return this;
        }

        renderListKeyed(items, keySelector, renderItem) {
            const apply = (list) => {
                const fragment = document.createDocumentFragment();
                const nextCache = new Map();
                const nextChildren = [];

                list.forEach((item, index) => {
                    const key = keySelector(item, index);
                    let child = this._keyedCache.get(key);
                    if (!child) child = renderItem(item, index);
                    if (!(child instanceof WebJSElement)) return;
                    if (typeof child._listUpdate === 'function') child._listUpdate(item, index);
                    child._parent = this;
                    nextCache.set(key, child);
                    nextChildren.push(child);
                    fragment.appendChild(child.node);
                });

                this._keyedCache.forEach((child, key) => {
                    if (!nextCache.has(key)) child.remove();
                });

                this.node.replaceChildren(fragment);
                this._children = nextChildren;
                this._keyedCache = nextCache;
                this._children.forEach((child) => child._notifyMounted());
            };

            if (this._listUnsubscribe) this._listUnsubscribe();
            if (isWebJSState(items)) this._listUnsubscribe = items.subscribe(apply);
            else apply(items);
            return this;
        }

        listUpdater(callback) {
            this._listUpdate = callback;
            return this;
        }

        on(eventName, handler, options) {
            this.node.addEventListener(eventName, handler, options);
            return this.own(() => this.node.removeEventListener(eventName, handler, options));
        }

        onClick(handler) { return this.on('click', handler); }
        onValueChanged(handler) { return this.on('input', handler); }
        onHover(over, out) {
            this.on('mouseenter', over);
            if (out) this.on('mouseleave', out);
            return this;
        }

        animate(keyframes, options = { duration: 500, fill: 'forwards' }) {
            this.node.animate(keyframes, options);
            return this;
        }

        focus() {
            this.node.focus();
            return this;
        }
    }

    const tags = [
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'section', 'article', 'nav', 'header', 'footer', 'main', 'aside',
        'button', 'input', 'textarea', 'select', 'option', 'label',
        'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
        'img', 'video', 'audio', 'canvas', 'svg', 'a', 'br', 'hr'
    ];

    const elementFactories = {};
    tags.forEach((tag) => {
        const methodName = tag === 'div' ? 'container' : tag === 'span' ? 'text' : tag === 'a' ? 'link' : tag;
        elementFactories[methodName] = (content = '') => {
            const element = new WebJSElement(tag);
            if (tag === 'img') element.attr('src', content);
            else if (tag === 'input' || tag === 'textarea') element.attr('placeholder', content);
            else if (content !== '') element.content = content;
            return element;
        };
    });
    elementFactories.fromId = (id) => {
        if (id == null) return null;
        const domId = userIdMap.get(String(id));
        return elementRegistry.get(domId) || null;
    };
    // Alias for backward compatibility: support .fromID as well as .fromId
    elementFactories.fromID = elementFactories.fromId;
    elementFactories.wrap = (selector) => {
        const node = typeof selector === 'string' ? document.querySelector(selector) : selector;
        return node ? WebJSElement.wrapNode(node) : null;
    };

    function configureContainerLayout(type) {
        const element = elementFactories.container();
        element._layoutType = type;
        if (type === 'vertical') element.css({ display: 'flex', flexDirection: 'column' });
        if (type === 'horizontal') element.css({ display: 'flex', flexDirection: 'row', alignItems: 'center' });
        if (type === 'stack') element.css({ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr' });
        return element;
    }

    function component(name, setup) {
        return function instantiate(props = {}) {
            const scope = new ComponentScope(name);
            const context = {
                state: createState,
                computed,
                effect(callback) {
                    const stop = effect(callback);
                    scope.cleanups.push(stop);
                    return stop;
                },
                cleanup(fn) {
                    scope.cleanups.push(fn);
                },
                onMount(fn) {
                    scope.mountCallbacks.push(fn);
                },
                onUnmount(fn) {
                    scope.unmountCallbacks.push(fn);
                },
                store: createStore,
                resource: createResource,
                route: currentRoute
            };
            const output = setup(props, context);
            if (!(output instanceof WebJSElement)) {
                throw new WebJSError(`Component "${name}" must return a WebJSElement.`);
            }
            output.useScope(scope);
            return output;
        };
    }

    function errorBoundary(render, fallback) {
        try {
            return render();
        } catch (error) {
            log(`Boundary caught: ${error.message}`);
            if (typeof fallback === 'function') return fallback(error);
            return elementFactories.container(String(error.message));
        }
    }

    function hydrate(target, render) {
        const hostNode = typeof target === 'string' ? document.querySelector(target) : target;
        if (!hostNode) throw new WebJSError(`Hydration target not found: ${target}`);
        hostNode.setAttribute('data-webjs-hydrated', 'true');
        const host = WebJSElement.wrapNode(hostNode);
        host.clear();
        const result = render(host);
        if (result instanceof WebJSElement && result !== host) host.append(result);
        host._notifyMounted();
        return host;
    }

    function setTitle(title) {
        const oldTitle = document.querySelector("title");
        if (oldTitle) {
            oldTitle.innerText = title;
        } else {
            const newTitle = document.createElement("title");
            newTitle.innerText = title;

            document.head.appendChild(newTitle);
        }
    }

    const api = {
        async request(url, options = {}) {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type') || '';
            const payload = contentType.includes('application/json')
                ? await response.json()
                : await response.text();
            if (!response.ok) {
                const error = new Error(`Request failed: ${response.status}`);
                error.response = response;
                error.payload = payload;
                throw error;
            }
            return payload;
        },
        get(url, options) {
            return api.request(url, { ...options, method: 'GET' });
        },
        post(url, data, options = {}) {
            return api.request(url, {
                ...options,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                body: JSON.stringify(data)
            });
        }
    };

    const storage = {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get(key, fallback = null) {
            try {
                const value = localStorage.getItem(key);
                return value == null ? fallback : JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    };

    log(`Initialized (version ${version})`);
    if (window.webjsLogging === 1) console.log(`------------------------`);

    return {
        version,
        main: mainTarget,
        element: elementFactories,
        container: {
            vertical: () => configureContainerLayout('vertical'),
            horizontal: () => configureContainerLayout('horizontal'),
            stack: () => configureContainerLayout('stack')
        },
        state: createState,
        computed,
        effect,
        batch,
        store: createStore,
        resource: createResource,
        component,
        errorBoundary,
        hydrate,
        setTitle,
        setLogging: (l) => {
            var logN = -1;

            switch (l) {
                case 'all':
                    logN = 0
                    break;
                case 'errors':
                    logN = 1
            }

            if (logN == -1) {
                throw new WebJSError('Invalid logging type passed to setLogging.');
            }

            window.webjsLogging = logN;
        },
        mount(element, target = document.body) {
            if (!(element instanceof WebJSElement)) throw new WebJSError('mount() requires a WebJSElement');
            element.mountTo(target);
            return element;
        },
        router: {
            route(path, handler) {
                const compiled = compileRoute(path === '/' ? '/' : path.replace(/\/+$/, ''));
                routeTable.push({ ...compiled, handler });
                return WebJS.router;
            },
            notFound(handler) {
                notFoundHandler = handler;
                return WebJS.router;
            },
            start() {
                startRouter();
                resolveRoute();
                return WebJS.router;
            },
            current: currentRoute
        },
        route(path, handler) {
            return this.router.route(path, handler);
        },
        navigate,
        api,
        storage,
        color: {
            white: '#ffffff',
            black: '#000000',
            red: '#b42318',
            blue: '#175cd3',
            green: '#027a48',
            dark: '#10233f',
            hex: (h) => { return `#${h.replace('#', '')}`; },
            rgba: (r, g, b, a) => { return `rgba(${r}, ${g}, ${b}, ${a})`; },
            rgb: (r, g, b) => { return WebJS.color.rgba(r, g, b, 1); },
        },
        font: {
            sansSerif: 'var(--webjs-font-sans)',
            serif: 'var(--webjs-font-serif)',
            mono: 'var(--webjs-font-mono)',
            custom: (f) => f
        },
        fontWeight: { bold: '700', normal: '400', light: '300', semibold: '600' },
        borderType: { solid: 'solid', dashed: 'dashed', dotted: 'dotted' },
        features: [
            'Reactive effects with cleanup',
            'Computed derived state',
            'Batched updates',
            'Immutable stores with selectors',
            'Async resources with cancellation',
            'Keyed list rendering',
            'Router with params and query parsing',
            'Component lifecycle hooks',
            'Error boundaries',
            'Hydration entrypoint'
        ]
    };
})();
