import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireTeamManager } from "@/lib/auth-api"
import { createPlayer, getPlayers } from "@/lib/db"
import { GET, POST } from "./route"

vi.mock("@/lib/auth-api", () => ({ requireTeamManager: vi.fn() }))
vi.mock("@/lib/db", () => ({ getPlayers: vi.fn(), createPlayer: vi.fn() }))

const jsonRequest = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const searchRequest = (params: Record<string, string>) =>
  ({ nextUrl: { searchParams: new URLSearchParams(params) } }) as unknown as NextRequest
const authedManager = { user: { id: "u-1", email: "e", isAdmin: false } }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/players", () => {
  it("returns 400 when teamId is missing", async () => {
    const res = await GET(searchRequest({}))
    expect(res.status).toBe(400)
    expect(getPlayers).not.toHaveBeenCalled()
  })

  it("returns players for the team", async () => {
    vi.mocked(getPlayers).mockResolvedValue([{ id: "p1" }] as never)
    const res = await GET(searchRequest({ teamId: "team-1" }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual([{ id: "p1" }])
    expect(getPlayers).toHaveBeenCalledWith("team-1")
  })
})

describe("POST /api/players", () => {
  it("returns 400 for an invalid body (before auth)", async () => {
    const res = await POST(jsonRequest({ name: "Pekka" })) // missing teamId
    expect(res.status).toBe(400)
    expect(requireTeamManager).not.toHaveBeenCalled()
  })

  it("returns the auth response when the user cannot manage the team", async () => {
    vi.mocked(requireTeamManager).mockResolvedValue({
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as never)

    const res = await POST(jsonRequest({ name: "Pekka", teamId: "team-1" }))
    expect(res.status).toBe(403)
    expect(createPlayer).not.toHaveBeenCalled()
  })

  it("creates the player for an authorized manager", async () => {
    vi.mocked(requireTeamManager).mockResolvedValue(authedManager as never)
    vi.mocked(createPlayer).mockResolvedValue({ id: "p-new", name: "Pekka" } as never)

    const res = await POST(jsonRequest({ name: "Pekka", teamId: "team-1" }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ id: "p-new", name: "Pekka" })
    expect(createPlayer).toHaveBeenCalledWith(expect.any(String), "Pekka", "team-1")
  })
})
