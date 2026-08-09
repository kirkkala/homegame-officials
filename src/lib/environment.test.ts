import { getEnvironmentInfo } from "@/lib/environment"

describe("getEnvironmentInfo", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.VERCEL_ENV
    delete process.env.VERCEL_GIT_COMMIT_REF
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("returns null in production", () => {
    process.env.VERCEL_ENV = "production"

    expect(getEnvironmentInfo()).toBeNull()
  })

  it("returns preview label with branch", () => {
    process.env.VERCEL_ENV = "preview"
    process.env.VERCEL_GIT_COMMIT_REF = "feature/foo"

    expect(getEnvironmentInfo()).toEqual({
      label: "Preview: feature/foo",
      severity: "warning",
    })
  })

  it("returns preview label without branch", () => {
    process.env.VERCEL_ENV = "preview"

    expect(getEnvironmentInfo()).toEqual({
      label: "Preview",
      severity: "warning",
    })
  })

  it("returns vercel development label", () => {
    process.env.VERCEL_ENV = "development"

    expect(getEnvironmentInfo()).toEqual({
      label: "Vercel development",
      severity: "info",
    })
  })

  it("returns local development label", () => {
    vi.stubEnv("NODE_ENV", "development")

    expect(getEnvironmentInfo()).toEqual({
      label: "Local development",
      severity: "info",
    })
  })

  it("returns null for unknown production-like environments", () => {
    vi.stubEnv("NODE_ENV", "production")

    expect(getEnvironmentInfo()).toBeNull()
  })
})
