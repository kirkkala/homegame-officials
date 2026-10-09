import type { NextRequest } from "next/server"
import { EMPTY_REBOUND_TRACKING } from "@/db/schema"
import { getGameById, updateGameRebounds } from "@/lib/db"
import { POST } from "./route"

vi.mock("@/lib/db", () => ({
  getGameById: vi.fn(),
  updateGameRebounds: vi.fn(),
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
const jsonRequest = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getGameById).mockResolvedValue(game as never)
  vi.mocked(updateGameRebounds).mockImplementation(async (_id, rebounds) => ({
    ...game,
    rebounds,
  }))
})

describe("POST /api/games/[id]/rebounds", () => {
  it("returns 404 when the game is missing", async () => {
    vi.mocked(getGameById).mockResolvedValue(null)
    const res = await POST(jsonRequest({ action: "claim", name: "Timo" }), { params })
    expect(res.status).toBe(404)
  })

  it("returns 400 for an invalid body", async () => {
    const res = await POST(jsonRequest({ action: "nope" }), { params })
    expect(res.status).toBe(400)
  })

  it("claims the counter and returns a token", async () => {
    const res = await POST(jsonRequest({ action: "claim", name: "Timo" }), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.counterName).toBe("Timo")
    expect(body.isCounter).toBe(true)
    expect(typeof body.token).toBe("string")
    expect(body.token.length).toBeGreaterThan(0)
    expect(updateGameRebounds).toHaveBeenCalled()
  })

  it("rejects a second counter unless takeOver is set", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: { ...EMPTY_REBOUND_TRACKING, counterName: "Timo", counterToken: "token-1" },
    } as never)

    const denied = await POST(jsonRequest({ action: "claim", name: "Aino" }), { params })
    expect(denied.status).toBe(409)
    await expect(denied.json()).resolves.toEqual({ error: "Timo pitää jo kirjaa" })

    const taken = await POST(jsonRequest({ action: "claim", name: "Aino", takeOver: true }), {
      params,
    })
    expect(taken.status).toBe(200)
    const body = await taken.json()
    expect(body.counterName).toBe("Aino")
    expect(body.token).not.toBe("token-1")
  })

  it("adds a rebound when the token matches", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: { ...EMPTY_REBOUND_TRACKING, counterName: "Timo", counterToken: "token-1" },
    } as never)

    const res = await POST(
      jsonRequest({ action: "add", token: "token-1", basket: "home", winner: "away" }),
      { params }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.awayDef).toBe(1)
    expect(body.homeOff).toBe(0)
    expect(body).not.toHaveProperty("events")
    expect(body).not.toHaveProperty("token")
  })

  it("rejects add without the counter token", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: { ...EMPTY_REBOUND_TRACKING, counterName: "Timo", counterToken: "token-1" },
    } as never)

    const res = await POST(
      jsonRequest({ action: "add", token: "other", basket: "home", winner: "home" }),
      { params }
    )
    expect(res.status).toBe(409)
  })

  it("decrements only the matching rebound counter", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: {
        ...EMPTY_REBOUND_TRACKING,
        counterName: "Timo",
        counterToken: "token-1",
        homeOff: 1,
        awayOff: 1,
      },
    } as never)

    const res = await POST(
      jsonRequest({ action: "remove", token: "token-1", basket: "home", winner: "home" }),
      { params }
    )
    const body = await res.json()
    expect(body.homeOff).toBe(0)
    expect(body.awayOff).toBe(1)
  })

  it("keeps the counter name after release", async () => {
    vi.mocked(getGameById).mockResolvedValue({
      ...game,
      rebounds: { ...EMPTY_REBOUND_TRACKING, counterName: "Timo", counterToken: "token-1" },
    } as never)

    const res = await POST(jsonRequest({ action: "release", token: "token-1" }), { params })
    const body = await res.json()
    expect(body.counterName).toBe("Timo")
    expect(body.counting).toBe(false)
    expect(body.isCounter).toBe(false)
  })
})
