import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { forbiddenResponse, requireAuthUser } from "@/lib/auth-api"
import { getUsers } from "@/lib/db"
import { GET } from "./route"

vi.mock("@/lib/auth-api", () => ({
  requireAuthUser: vi.fn(),
  forbiddenResponse: vi.fn(() => NextResponse.json({ error: "Forbidden" }, { status: 403 })),
}))
vi.mock("@/lib/db", () => ({ getUsers: vi.fn() }))

const fakeRequest = {} as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/users", () => {
  it("returns the auth response when unauthenticated", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never)

    const res = await GET(fakeRequest)
    expect(res.status).toBe(401)
    expect(getUsers).not.toHaveBeenCalled()
  })

  it("returns 403 for a non-admin user", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue({
      user: { id: "u-1", email: "e", isAdmin: false },
    } as never)

    const res = await GET(fakeRequest)
    expect(res.status).toBe(403)
    expect(forbiddenResponse).toHaveBeenCalled()
    expect(getUsers).not.toHaveBeenCalled()
  })

  it("returns the users for an admin", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue({
      user: { id: "u-admin", email: "e", isAdmin: true },
    } as never)
    vi.mocked(getUsers).mockResolvedValue([{ id: "u-1" }] as never)

    const res = await GET(fakeRequest)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual([{ id: "u-1" }])
  })
})
