const PREFIX = "dapurArab.";

export function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn("Progres tidak dapat disimpan di browser ini.", error);
  }
}
