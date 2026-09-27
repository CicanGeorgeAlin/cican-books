/**
 * CICAN local-first reading state.
 * No network, analytics, or account dependency.
 */

const CICAN_STORAGE_VERSION = 1;
const PREFIX = "cican:";

function storageKey(bookId, mode = "book") {
  return PREFIX + "v" + CICAN_STORAGE_VERSION + ":" + mode + ":" + bookId;
}

export function loadReadingState(bookId) {
  if (!bookId) return null;
  try {
    const raw = localStorage.getItem(storageKey(bookId, "reading"));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function saveReadingState(bookId, state) {
  if (!bookId) return;
  try {
    localStorage.setItem(
      storageKey(bookId, "reading"),
      JSON.stringify({
        version: CICAN_STORAGE_VERSION,
        updatedAt: Date.now(),
        ...state
      })
    );
  } catch (_) {}
}

export function clearReadingState(bookId) {
  if (!bookId) return;
  try {
    localStorage.removeItem(storageKey(bookId, "reading"));
  } catch (_) {}
}

export function loadReaderPreferences() {
  try {
    const raw = localStorage.getItem(PREFIX + "v" + CICAN_STORAGE_VERSION + ":preferences");
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

export function saveReaderPreferences(preferences) {
  try {
    localStorage.setItem(
      PREFIX + "v" + CICAN_STORAGE_VERSION + ":preferences",
      JSON.stringify({
        version: CICAN_STORAGE_VERSION,
        updatedAt: Date.now(),
        ...preferences
      })
    );
  } catch (_) {}
}
