import { getReboundHelpOpen, setReboundHelpOpen } from "@/lib/rebound-session"

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  })
})

describe("rebound session", () => {
  it("remembers whether rebound help is open", () => {
    expect(getReboundHelpOpen()).toBe(true)
    setReboundHelpOpen(false)
    expect(getReboundHelpOpen()).toBe(false)
    setReboundHelpOpen(true)
    expect(getReboundHelpOpen()).toBe(true)
  })
})
