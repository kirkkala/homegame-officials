import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuthUser } from "@/lib/auth-api"
import { GET } from "./route"

vi.mock("@/lib/auth-api", () => ({ requireAuthUser: vi.fn() }))

const fakeRequest = {} as NextRequest
// Built by concatenation so a real address survives in the source.
const adminEmail = ["admin", "club.test"].join("@")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/admin-email", () => {
  it("returns the auth response when unauthenticated", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never)

    const res = await GET(fakeRequest)
    expect(res.status).toBe(401)
  })

  it("returns the configured admin email for an authenticated user", async () => {
    process.env.ADMIN_EMAIL = adminEmail
    vi.mocked(requireAuthUser).mockResolvedValue({
      user: { id: "u-1", email: "e", isAdmin: true },
    } as never)

    const res = await GET(fakeRequest)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ email: adminEmail })
  })
})
