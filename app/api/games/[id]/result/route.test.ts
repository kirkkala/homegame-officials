import type { NextRequest } from "next/server"
import { EMPTY_REBOUND_TRACKING } from "@/db/schema"
import { getGameById, updateGameResult } from "@/lib/db"
import { POST } from "./route"

vi.mock("@/lib/db", () => ({
  getGameById: vi.fn(),
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
  rebounds: { ...EMPTY_REBOUND_TRACKING },
  result: null,
  createdAt: new Date("2026-01-01"),
}

const params = Promise.resolve({ id: "game-1" })
const jsonRequest = (body: unknown, headers?: Headers) =>
  ({
    json: async () => body,
    headers: headers ?? new Headers(),
  }) as unknown as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getGameById).mockResolvedValue(game as never)
  vi.mocked(updateGameResult).mockImplementation(async (_id, result) => ({
    ...game,
    result,
  }))
})

describe("POST /api/games/[id]/result", () => {
  it("returns 404 when the game is missing", async () => {
    vi.mocked(getGameById).mockResolvedValue(null)
    const res = await POST(jsonRequest({ home: 64, away: 58 }), { params })
    expect(res.status).toBe(404)
    expect(updateGameResult).not.toHaveBeenCalled()
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

  it("rejects a result from others while live basket tracking is on", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: {
        ...EMPTY_REBOUND_TRACKING,
        counterName: "Timo",
        counterToken: "token-1",
        trackBaskets: true,
      },
    } as never)

    const res = await POST(jsonRequest({ home: 64, away: 58 }), { params })
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toEqual({ error: "Timo kirjaa tilastoa" })
    expect(updateGameResult).not.toHaveBeenCalled()
  })

  it("lets the counter save while live basket tracking is on", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: {
        ...EMPTY_REBOUND_TRACKING,
        counterName: "Timo",
        counterToken: "token-1",
        trackBaskets: true,
      },
    } as never)

    const res = await POST(
      jsonRequest({ home: 64, away: 58 }, new Headers({ "X-Rebound-Token": "token-1" })),
      { params }
    )
    expect(res.status).toBe(200)
    expect(updateGameResult).toHaveBeenCalledWith("game-1", { home: 64, away: 58 })
  })
})
