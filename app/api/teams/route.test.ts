import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuthUser } from "@/lib/auth-api"
import { addTeamManager, createTeam, getTeamById, getTeams } from "@/lib/db"
import { GET, POST } from "./route"

vi.mock("@/lib/auth-api", () => ({ requireAuthUser: vi.fn() }))
vi.mock("@/lib/db", () => ({
  getTeams: vi.fn(),
  getTeamById: vi.fn(),
  createTeam: vi.fn(),
  addTeamManager: vi.fn(),
}))

const jsonRequest = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const authedUser = { user: { id: "u-1", email: "e", isAdmin: false } }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/teams", () => {
  it("returns the list of teams", async () => {
    vi.mocked(getTeams).mockResolvedValue([{ id: "t1" }] as never)
    const res = await GET()
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual([{ id: "t1" }])
  })

  it("returns 500 when the query fails", async () => {
    vi.mocked(getTeams).mockRejectedValue(new Error("db down"))
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe("POST /api/teams", () => {
  it("returns the auth response when unauthenticated", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue({
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as never)

    const res = await POST(jsonRequest({ name: "Tigers" }))
    expect(res.status).toBe(401)
    expect(createTeam).not.toHaveBeenCalled()
  })

  it("returns 400 for an invalid body", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue(authedUser as never)
    const res = await POST(jsonRequest({ name: "" }))
    expect(res.status).toBe(400)
  })

  it("returns 409 when a team with the same slug exists", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue(authedUser as never)
    vi.mocked(getTeamById).mockResolvedValue({ id: "tigers" } as never)

    const res = await POST(jsonRequest({ name: "Tigers" }))
    expect(res.status).toBe(409)
    expect(createTeam).not.toHaveBeenCalled()
  })

  it("creates the team, assigns the creator as manager, and returns it", async () => {
    vi.mocked(requireAuthUser).mockResolvedValue(authedUser as never)
    vi.mocked(getTeamById).mockResolvedValue(undefined as never)
    vi.mocked(createTeam).mockResolvedValue({ id: "tigers", name: "Tigers" } as never)

    const res = await POST(jsonRequest({ name: "Tigers" }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ id: "tigers", name: "Tigers" })
    expect(createTeam).toHaveBeenCalledWith("tigers", "Tigers")
    expect(addTeamManager).toHaveBeenCalledWith("tigers", "u-1")
  })
})
