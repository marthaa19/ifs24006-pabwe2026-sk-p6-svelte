import { writable } from "svelte/store";

export const currentPath = writable(window.location.pathname);

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  currentPath.set(path);
}

window.addEventListener("popstate", () => {
  currentPath.set(window.location.pathname);
});

// layout: "auth" = layout autentikasi, "app" = layout aplikasi (Tahap 3)
export const routes = [
  { name: "login", pattern: "/auth/login", layout: "auth" },
  { name: "register", pattern: "/auth/register", layout: "auth" },
  { name: "home", pattern: "/", layout: "app" },
  { name: "linkTreeDetail", pattern: "/link-trees/:linkTreeId", layout: "app" },
  { name: "users", pattern: "/users", layout: "app" },
  { name: "profile", pattern: "/profile", layout: "app" },
];

// Untuk <a href>: klik biasa -> navigasi SPA, ctrl/cmd/shift-klik -> perilaku bawaan browser
export function goto(event, path) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();
  navigate(path);
}

function match(pattern, path) {
  const p = pattern.split("/").filter(Boolean);
  const s = path.split("/").filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function resolveRoute(path) {
  for (const route of routes) {
    const params = match(route.pattern, path);
    if (params) return { name: route.name, layout: route.layout, params };
  }
  return { name: "notFound", layout: "none", params: {} };
}
