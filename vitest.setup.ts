import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach, vi } from "vitest"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
}))

// Components and the storage layer call fetch() with relative "/api/..." URLs.
// Under happy-dom these resolve against http://localhost:3000, and with no dev
// server running the requests would hit the network and reject with ECONNREFUSED.
// Stub fetch with a benign empty-JSON response so stray, unmocked calls stay quiet.
// Tests needing real responses mock the storage modules or override fetch themselves.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response("[]", {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    )
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
