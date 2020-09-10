import store from 'store/dist/store.modern';

const storageKey = 'did.playground.token';

export function setToken(token) {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return store.set(storageKey, token);
}

export function getToken() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return store.get(storageKey);
}

export function removeToken() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return store.remove(storageKey);
}

export function onAuthError(err) {
  if (err.code === 403) {
    setTimeout(() => {
      removeToken();
      window.location.href = '/?openLogin=true';
    }, 3000);
  }
}
