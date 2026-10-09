const NAME_KEY = "rebound-counter-name"

function tokenKey(gameId: string) {
  return `rebound-token:${gameId}`
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readStorage(key: string): string | null {
  if (!canUseStorage()) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage errors (private mode / missing localStorage in tests)
  }
}

function removeStorage(key: string) {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}

export function getSavedCounterName(): string {
  return readStorage(NAME_KEY) ?? ""
}

export function setSavedCounterName(name: string) {
  writeStorage(NAME_KEY, name)
}

export function getReboundToken(gameId: string): string | null {
  return readStorage(tokenKey(gameId))
}

export function setReboundToken(gameId: string, token: string) {
  writeStorage(tokenKey(gameId), token)
}

export function clearReboundToken(gameId: string) {
  removeStorage(tokenKey(gameId))
}
