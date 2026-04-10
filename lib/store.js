const store = new Map();

export function saveLink(id, url) {
  store.set(id, url);
}

export function getLink(id) {
  return store.get(id);
}