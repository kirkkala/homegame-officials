import type { NextRequest } from "next/server"
import { updateGameResult } from "@/lib/db"
import { POST } from "./route"

vi.mock("@/lib/db", () => ({
  updateGameResult: vi.fn(),
}))

const game = {
  id: "game-1",
  teamId: "team-1",
  divisionId: "II Div.",
  homeTeam: "Stadi",
  awayTeam: "KlaNMKY",
  isHomeGame: true,
  date: "2026-10-07",
  time: "18:30",
  location: "Halli 1",
  officials: { poytakirja: null, kello: null },
  rebounds: {
    homeOff: 0,
    homeDef: 0,
    awayOff: 0,
    awayDef: 0,
    counterName: null,
    counterToken: null,
    updatedAt: null,
  },
  result: null,
  createdAt: new Date("2026-01-01"),
}

const params = Promise.resolve({ id: "game-1" })
const jsonRequest = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(updateGameResult).mockImplementation(async (_id, result) => ({
    ...game,
    result,
  }))
})

describe("POST /api/games/[id]/result", () => {
  it("returns 404 when the game is missing", async () => {
    vi.mocked(updateGameResult).mockResolvedValue(null)
    const res = await POST(jsonRequest({ home: 64, away: 58 }), { params })
    expect(res.status).toBe(404)
  })

  it("returns 400 for an invalid score", async () => {
    const res = await POST(jsonRequest({ home: -1, away: 58 }), { params })
    expect(res.status).toBe(400)
  })

  it("saves the result", async () => {
    const res = await POST(jsonRequest({ home: 64, away: 58 }), { params })
    expect(res.status).toBe(200)
    expect(updateGameResult).toHaveBeenCalledWith("game-1", { home: 64, away: 58 })
    const body = await res.json()
    expect(body.result).toEqual({ home: 64, away: 58 })
  })
})
