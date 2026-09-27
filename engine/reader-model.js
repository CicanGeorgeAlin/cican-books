/**
 * CICAN reader model.
 * Pure state helpers; no DOM assumptions.
 */

export const READER_MODES = Object.freeze({
  FIFTEEN: "15",
  FULL: "full"
});

export function createReaderState(book, mode = READER_MODES.FIFTEEN) {
  return {
    bookId: book.id,
    mode,
    position: 0,
    progress: 0,
    completed: false,
    paused: false,
    updatedAt: Date.now()
  };
}

export function clampProgress(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

export function estimateSeconds(book) {
  return Math.max(
    60,
    Number(book.targetMinutes) * 60 || 900
  );
}

export function textForMode(book, mode) {
  if (mode === READER_MODES.FULL) {
    return book.fullText || "";
  }

  return book.fifteenMinuteText || book.text || "";
}
