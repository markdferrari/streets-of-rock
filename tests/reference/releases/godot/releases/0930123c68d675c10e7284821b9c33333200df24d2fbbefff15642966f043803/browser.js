// web/semantics.ts
var tags = { button: "button", slider: "input", checkbox: "button", heading: "h2", meter: "meter", dialog: "div" };
function validateSemanticDescriptor(value) {
  const b = value.bounds;
  if (!value.id || !value.name || !Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.width) || !Number.isFinite(b.height) || b.width < 0 || b.height < 0)
    return false;
  if (value.role === "slider" && (!Number.isFinite(value.value) || !Number.isFinite(value.min) || !Number.isFinite(value.max) || value.min > value.value || value.value > value.max))
    return false;
  if (value.role === "meter" && (!Number.isFinite(value.value) || !Number.isFinite(value.min) || !Number.isFinite(value.max)))
    return false;
  return true;
}

class SemanticProjection {
  layer;
  dispatch;
  elements = new Map;
  modal = false;
  constructor(layer, dispatch) {
    this.layer = layer;
    this.dispatch = dispatch;
  }
  render(generation, descriptors) {
    const current = new Set(descriptors.map((d) => d.id));
    for (const [id, element] of this.elements)
      if (!current.has(id)) {
        element.remove();
        this.elements.delete(id);
      }
    this.modal = descriptors.some((d) => d.role === "dialog");
    let dialogElement = null;
    for (const descriptor of descriptors) {
      let element = this.elements.get(descriptor.id);
      const tag = tags[descriptor.role];
      if (element && element.tagName.toLowerCase() !== tag) {
        element.remove();
        this.elements.delete(descriptor.id);
        element = undefined;
      }
      if (!element) {
        element = document.createElement(tag);
        element.dataset.controlId = descriptor.id;
        element.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        if (descriptor.role === "slider") {
          element.type = "range";
          element.step = "any";
          element.addEventListener("input", () => this.dispatch(descriptor.id, "value", Number(element.value)));
        } else if (descriptor.role === "checkbox") {
          element.addEventListener("click", () => this.dispatch(descriptor.id, "value", element.getAttribute("aria-checked") !== "true"));
        } else if (descriptor.role === "button")
          element.addEventListener("click", () => this.dispatch(descriptor.id, "activate"));
        element.addEventListener("focus", () => this.dispatch(descriptor.id, "focus"));
        element.addEventListener("keydown", (event) => {
          if (descriptor.role === "button" && ["Enter", " "].includes(event.key)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (!event.repeat)
              this.dispatch(descriptor.id, "activate");
          }
          if (descriptor.id.startsWith("character-") && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            const roster = [...this.elements.values()].filter((item) => item.dataset.controlId?.startsWith("character-")).sort((a, b) => Number(a.dataset.focusOrder) - Number(b.dataset.focusOrder));
            const index = roster.indexOf(element);
            const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
            if (roster.length) {
              event.preventDefault();
              roster[(index + step + roster.length) % roster.length].focus();
            }
          }
          if (this.modal && event.key === "Tab")
            this.trapTab(event);
        });
        this.elements.set(descriptor.id, element);
      }
      if (descriptor.role === "dialog")
        dialogElement = element;
      const parent = descriptor.role === "dialog" ? this.layer : this.modal ? dialogElement : this.layer;
      if (parent && element.parentElement !== parent)
        parent.append(element);
      element.dataset.generation = String(generation);
      element.textContent = descriptor.text ?? descriptor.name;
      element.setAttribute("aria-label", descriptor.name);
      if (descriptor.role === "button" || descriptor.role === "checkbox") {
        element.disabled = !!descriptor.disabled;
        if (descriptor.role === "checkbox")
          element.setAttribute("aria-checked", String(!!descriptor.pressed));
        else
          element.setAttribute("aria-pressed", String(!!descriptor.pressed));
      }
      if (descriptor.role === "slider") {
        const input = element;
        input.disabled = !!descriptor.disabled;
        input.min = String(descriptor.min);
        input.max = String(descriptor.max);
        input.value = String(descriptor.value);
        element.setAttribute("aria-valuenow", input.value);
        element.setAttribute("aria-valuemin", input.min);
        element.setAttribute("aria-valuemax", input.max);
      }
      if (descriptor.role === "meter") {
        const meter = element;
        meter.min = descriptor.min;
        meter.max = descriptor.max;
        meter.value = descriptor.value;
      }
      if (descriptor.role === "dialog") {
        element.setAttribute("role", "dialog");
        element.setAttribute("aria-modal", "true");
      }
      if (descriptor.liveRegion)
        element.setAttribute("aria-live", descriptor.liveRegion);
      element.dataset.focusOrder = String(descriptor.focusOrder ?? 0);
      element.tabIndex = ["heading", "dialog", "meter"].includes(descriptor.role) || descriptor.id.startsWith("character-") && !descriptor.focused ? -1 : descriptor.focusOrder ?? 0;
      element.hidden = descriptor.visible === false;
      const b = descriptor.bounds;
      Object.assign(element.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.width}px`, height: `${b.height}px` });
    }
    this.layer.setAttribute("aria-label", this.modal ? "Settings dialog" : "Game controls");
    this.layer.setAttribute("role", "group");
  }
  trapTab(event) {
    const focusable = [...this.elements.values()].filter((el) => !el.hidden && !(("disabled" in el) && el.disabled) && el.tabIndex >= 0);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const active = focusable.indexOf(document.activeElement);
    if (event.shiftKey && active <= 0) {
      event.preventDefault();
      focusable.at(-1).focus();
    } else if (!event.shiftKey && (active < 0 || active === focusable.length - 1)) {
      event.preventDefault();
      focusable[0].focus();
    }
  }
}

// web/browser.ts
var keys = ["sor.settings.v1", "streets-of-rock.best.v1", "streets-of-rock.tutorial.v1"];

class BrowserAdapter {
  host;
  buildId;
  mode;
  apiVersion = 1;
  callback = null;
  pendingStatus = new Map;
  unwatch = null;
  generation = -1;
  controls = new Map;
  constructor(host, buildId, mode = "release") {
    this.host = host;
    this.buildId = buildId;
    this.mode = mode;
  }
  environment() {
    const env = this.host.environment();
    if (![env.width, env.height, env.dpr].every((n) => Number.isFinite(n) && n > 0))
      throw new Error("Invalid environment geometry");
    return env;
  }
  initialize(callback, version = 1) {
    if (version !== this.apiVersion)
      throw new Error("Unsupported browser protocol");
    const environment = this.environment();
    this.dispose();
    this.callback = callback;
    for (const value of this.pendingStatus.values())
      callback(JSON.stringify(value));
    this.pendingStatus.clear();
    this.unwatch = this.host.watch(() => {
      this.emit({ type: "environment", environment: this.environment() });
    }, (indices) => this.emit({ type: "touchCancel", indices }));
    return { apiVersion: this.apiVersion, environment, buildId: this.buildId, mode: this.mode, stored: Object.fromEntries(keys.map((key) => [key, this.readStored(key)])) };
  }
  initializeJson(callback, version = 1) {
    return JSON.stringify(this.initialize(callback, version));
  }
  emit(value) {
    if (this.callback) {
      this.callback(JSON.stringify(value));
      return;
    }
    if (value && typeof value === "object" && ["cacheStatus", "updateWaiting"].includes(String(value.type)))
      this.pendingStatus.set(String(value.type), value);
  }
  notify(type, detail = {}) {
    this.emit({ type, ...detail });
  }
  readStored(key) {
    if (!keys.includes(key))
      return { ok: false, error: "Key is not allowlisted", value: null };
    try {
      return { ok: true, value: this.host.read(key) };
    } catch {
      return { ok: false, error: "Storage unavailable", value: null };
    }
  }
  writeStored(key, value) {
    if (!keys.includes(key) || typeof value !== "string")
      return { ok: false, error: "Invalid storage operation" };
    try {
      this.host.write(key, value);
      return { ok: true };
    } catch {
      return { ok: false, error: "Storage unavailable" };
    }
  }
  readStoredJson(key) {
    return JSON.stringify(this.readStored(key));
  }
  writeStoredJson(key, value) {
    return JSON.stringify(this.writeStored(key, value));
  }
  publishUi(json) {
    const value = JSON.parse(json);
    if (!Number.isSafeInteger(value.generation) || value.generation < this.generation || !Array.isArray(value.controls))
      return;
    const controls = new Map;
    const env = this.environment(), left = env.safeInsets.left, right = env.width - env.safeInsets.right, top = env.safeInsets.top, bottom = env.height - env.safeInsets.bottom;
    for (const source of value.controls) {
      if (!validateSemanticDescriptor(source) || controls.has(source.id))
        throw new Error("Invalid semantic descriptor");
      const d = { ...source, bounds: { ...source.bounds } };
      d.bounds.x = Math.min(Math.max(left, d.bounds.x), right);
      d.bounds.y = Math.min(Math.max(top, d.bounds.y), bottom);
      d.bounds.width = Math.max(0, Math.min(d.bounds.width, right - d.bounds.x));
      d.bounds.height = Math.max(0, Math.min(d.bounds.height, bottom - d.bounds.y));
      if (!d.bounds.width || !d.bounds.height)
        d.visible = false;
      controls.set(d.id, d);
    }
    this.generation = value.generation;
    this.controls = controls;
    this.host.render?.(value.generation, [...controls.values()], (id, kind, v) => this.intent(value.generation, id, kind, v));
  }
  intent(generation, id, kind, value) {
    const control = this.controls.get(id);
    if (!this.callback || generation !== this.generation || !control || control.disabled || !["focus", "activate", "key", "value"].includes(kind))
      return false;
    if (kind === "value" && (typeof value !== "number" || !Number.isFinite(value) || control.min !== undefined && value < control.min || control.max !== undefined && value > control.max))
      return false;
    this.emit({ type: "uiIntent", generation, id, kind, ...value === undefined ? {} : { value } });
    return true;
  }
  dispose() {
    this.unwatch?.();
    this.unwatch = null;
    this.callback = null;
  }
}
function installBrowser(win, doc, buildId, mode = "release") {
  let adapter;
  const probe = doc.createElement("div");
  probe.style.cssText = "position:fixed;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  doc.body.append(probe);
  let focused = doc.hasFocus();
  const layer = doc.getElementById("semantics");
  let dispatch = () => {};
  let projection;
  const host = {
    environment: () => {
      const style = win.getComputedStyle(probe);
      return { width: win.innerWidth, height: win.innerHeight, dpr: Math.min(win.devicePixelRatio || 1, 1.5), safeInsets: { top: parseFloat(style.paddingTop) || 0, right: parseFloat(style.paddingRight) || 0, bottom: parseFloat(style.paddingBottom) || 0, left: parseFloat(style.paddingLeft) || 0 }, visible: doc.visibilityState !== "hidden", focused, portrait: win.innerHeight > win.innerWidth, reducedMotion: win.matchMedia("(prefers-reduced-motion: reduce)").matches };
    },
    read: (key) => win.localStorage.getItem(key),
    write: (key, value) => win.localStorage.setItem(key, value),
    watch: (callback, onCancel) => {
      const resize = () => {
        const canvas = doc.querySelector("canvas");
        const env = host.environment();
        canvas.width = Math.round(env.width * env.dpr);
        canvas.height = Math.round(env.height * env.dpr);
        callback();
      };
      const focus = () => {
        focused = true;
        callback();
      }, blur = () => {
        focused = false;
        callback();
      };
      const touchCancel = (event) => onCancel?.(Array.from(event.changedTouches, (touch) => touch.identifier));
      const canvas = doc.querySelector("canvas");
      const contextListeners = [[canvas, "webglcontextlost", (event) => {
        event.preventDefault();
        adapter.notify("contextLost");
      }, true], [canvas, "webglcontextrestored", () => adapter.notify("contextRestored"), true]];
      const listeners = [[canvas, "touchcancel", touchCancel, true], [doc, "visibilitychange", callback], [win, "focus", focus], [win, "blur", blur], [win, "resize", resize], [win, "orientationchange", resize], [win.matchMedia("(prefers-reduced-motion: reduce)"), "change", callback]];
      for (const [target, event, listener, capture] of [...listeners, ...contextListeners])
        target.addEventListener(event, listener, capture);
      return () => {
        for (const [target, event, listener, capture] of [...listeners, ...contextListeners])
          target.removeEventListener(event, listener, capture);
      };
    },
    render: (generation, descriptors, intent) => {
      dispatch = intent;
      projection.render(generation, descriptors);
    }
  };
  projection = new SemanticProjection(layer, (id, kind, value) => dispatch(id, kind, value));
  adapter = new BrowserAdapter(host, buildId, mode);
  return adapter;
}

// web/cache-client.ts
function requestCache(worker, buildId, repair = false, onProgress) {
  const requestId = crypto.randomUUID();
  const failed = (error) => ({ type: "CACHE_STATUS", protocolVersion: 1, requestId, buildId, missing: [], corrupt: [], state: "error", error });
  if (!worker)
    return Promise.resolve(failed("Offline cache unavailable"));
  return new Promise((resolve) => {
    const channel = new MessageChannel;
    let done = false;
    let idle;
    const finish = (value) => {
      if (done)
        return;
      done = true;
      clearTimeout(idle);
      clearTimeout(total);
      channel.port1.close();
      resolve(value);
    };
    const reset = () => {
      clearTimeout(idle);
      idle = setTimeout(() => finish(failed("Cache audit idle timeout")), 1e4);
    };
    const total = setTimeout(() => finish(failed("Cache audit deadline exceeded")), 120000);
    reset();
    channel.port1.onmessage = (event) => {
      const data = event.data;
      if (data?.requestId !== requestId)
        return;
      if (data.type === "CACHE_PROGRESS") {
        onProgress?.(data);
        reset();
        return;
      }
      if (data.type !== "CACHE_STATUS" || data.protocolVersion !== 1 || data.buildId !== buildId || !Array.isArray(data.missing) || !Array.isArray(data.corrupt) || !["ready", "error"].includes(data.state)) {
        finish(failed("Cache reply release/protocol mismatch"));
        return;
      }
      const validPaths = (items) => items.every((item) => typeof item === "string");
      if (!validPaths(data.missing) || !validPaths(data.corrupt)) {
        finish(failed("Cache reply contains invalid paths"));
        return;
      }
      finish({ ...data, state: data.state === "ready" && !data.missing.length && !data.corrupt.length ? "ready" : "error" });
    };
    channel.port1.onmessageerror = () => finish(failed("Cache reply could not be decoded"));
    try {
      worker.postMessage({ type: repair ? "CACHE_REPAIR" : "CACHE_STATUS", protocolVersion: 1, expectedBuildId: buildId, requestId }, [channel.port2]);
    } catch (error) {
      finish(failed(`Cache request failed: ${String(error)}`));
    }
  });
}

// web/runtime-loader.ts
async function startRuntime(engine, base, packs) {
  if (!packs.length || new Set(packs).size !== packs.length || packs.some((p) => !/^[a-z0-9_-]+\.pck$/.test(p)))
    throw new Error("Invalid pack mount order");
  await engine.init(base);
  for (const pack of packs)
    await engine.preloadFile(`${base.slice(0, base.lastIndexOf("/") + 1)}${pack}`, pack);
  await engine.start({ args: ["--main-pack", packs[0]] });
}

// web/main.ts
var host = window;
var boot = host.SorBoot;
var adapter = installBrowser(window, document, boot.buildId, boot.mode);
var checkCache = async (repair = false) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await requestCache(navigator.serviceWorker.controller ?? registration.active, boot.buildId, repair);
    adapter.notify("cacheStatus", result);
  } catch (error) {
    adapter.notify("cacheStatus", { state: "error", error: String(error), missing: [], corrupt: [] });
  }
};
var browserApi = Object.assign(adapter, { cacheStatus: () => checkCache(false), repairCache: () => checkCache(true) });
if (false) {}
host.SorBrowser = browserApi;
host.SorPackMountOrder = boot.packs.slice(1);
var canvas = document.querySelector("canvas");
canvas.width = Math.round(innerWidth * Math.min(devicePixelRatio || 1, 1.5));
canvas.height = Math.round(innerHeight * Math.min(devicePixelRatio || 1, 1.5));
var status = document.getElementById("status");
var retry = document.getElementById("retry");
retry.addEventListener("click", () => location.reload());
async function launch() {
  try {
    const engine = new host.Engine({ ...boot.config, canvas, canvasResizePolicy: 0, executable: boot.executable, mainPack: boot.packs[0], onProgress: (done, total) => {
      status.textContent = total ? `Loading ${Math.round(done / total * 100)}%…` : "Loading Streets of Rock…";
    } });
    await startRuntime(engine, boot.executable, boot.packs);
    document.getElementById("boot").hidden = true;
  } catch (error) {
    status.textContent = `Unable to load Streets of Rock: ${String(error)}`;
    retry.hidden = false;
  }
}
navigator.serviceWorker?.register("/sw.js", { scope: "/" }).then((registration) => {
  const publish = () => {
    if (registration.waiting)
      adapter.notify("updateWaiting", { waiting: true });
  };
  publish();
  registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", publish));
  checkCache(false);
}).catch((error) => adapter.notify("cacheStatus", { state: "error", error: String(error), missing: [], corrupt: [] }));
launch();
