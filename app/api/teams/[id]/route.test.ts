import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireTeamManager } from "@/lib/auth-api"
import { getTeamById, updateTeamSettings } from "@/lib/db"
import { PATCH } from "./route"

vi.mock("@/lib/auth-api", () => ({ requireTeamManager: vi.fn() }))
vi.mock("@/lib/db", () => ({
  getTeamById: vi.fn(),
  updateTeamSettings: vi.fn(),
  deleteTeam: vi.fn(),
}))

const jsonRequest = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const params = (id: string) => ({ params: Promise.resolve({ id }) })
const manager = { user: { id: "u-1", email: "e", isAdmin: false } }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("PATCH /api/teams/[id]", () => {
  it("returns 404 when the team does not exist", async () => {
    vi.mocked(getTeamById).mockResolvedValue(undefined as never)
    const res = await PATCH(jsonRequest({ shotClockEnabled: true }), params("t1"))
    expect(res.status).toBe(404)
    expect(updateTeamSettings).not.toHaveBeenCalled()
  })

  it("returns the auth response when the caller is not a team manager", async () => {
    vi.mocked(getTeamById).mockResolvedValue({ id: "t1" } as never)
    vi.mocked(requireTeamManager).mockResolvedValue({
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as never)

    const res = await PATCH(jsonRequest({ shotClockEnabled: true }), params("t1"))
    expect(res.status).toBe(403)
    expect(updateTeamSettings).not.toHaveBeenCalled()
  })

  it("returns 400 for an empty settings body", async () => {
    vi.mocked(getTeamById).mockResolvedValue({ id: "t1" } as never)
    vi.mocked(requireTeamManager).mockResolvedValue(manager as never)

    const res = await PATCH(jsonRequest({}), params("t1"))
    expect(res.status).toBe(400)
    expect(updateTeamSettings).not.toHaveBeenCalled()
  })

  it("updates the shot clock setting and returns the team", async () => {
    vi.mocked(getTeamById).mockResolvedValue({ id: "t1" } as never)
    vi.mocked(requireTeamManager).mockResolvedValue(manager as never)
    vi.mocked(updateTeamSettings).mockResolvedValue({ id: "t1", shotClockEnabled: true } as never)

    const res = await PATCH(jsonRequest({ shotClockEnabled: true }), params("t1"))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ id: "t1", shotClockEnabled: true })
    expect(updateTeamSettings).toHaveBeenCalledWith("t1", { shotClockEnabled: true })
  })
})
