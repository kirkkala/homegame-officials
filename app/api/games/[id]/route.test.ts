import type { NextRequest } from "next/server"
import { getGameById } from "@/lib/db"
import { GET } from "./route"

vi.mock("@/lib/auth-api", () => ({
  requireTeamManager: vi.fn(),
}))
vi.mock("@/lib/db", () => ({
  getGameById: vi.fn(),
  updateGame: vi.fn(),
  deleteGame: vi.fn(),
}))

const game = {
  id: "game-1",
  teamId: "team-1",
  homeTeam: "Stadi",
  awayTeam: "KlaNMKY",
  isHomeGame: true,
  rebounds: {
    counterName: "Timo",
    counterToken: "secret-token",
    events: [],
  },
}

const params = Promise.resolve({ id: "game-1" })

describe("GET /api/games/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 404 when the game is missing", async () => {
    vi.mocked(getGameById).mockResolvedValue(null)
    const res = await GET({ headers: new Headers() } as NextRequest, { params })
    expect(res.status).toBe(404)
  })

  it("strips the counter token and reports whether this client is counting", async () => {
    vi.mocked(getGameById).mockResolvedValue(game as never)
    const res = await GET(
      { headers: new Headers({ "X-Rebound-Token": "secret-token" }) } as NextRequest,
      { params }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rebounds).toEqual({
      counterName: "Timo",
      events: [],
      isCounter: true,
    })
    expect(JSON.stringify(body)).not.toContain("secret-token")
  })
})
