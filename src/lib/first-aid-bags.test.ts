import { getBagCountForTeam, getFirstAidBags, setBagHolder } from "@/lib/first-aid-bags"

const jsonFetch = (body: unknown) =>
  vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } })
    )
  )

describe("getBagCountForTeam", () => {
  it("defaults to 3 when the team is null or has no count", () => {
    expect(getBagCountForTeam(null)).toBe(3)
    expect(getBagCountForTeam({})).toBe(3)
  })

  it("returns the configured count when within 1-6", () => {
    expect(getBagCountForTeam({ firstAidBagCount: "1" })).toBe(1)
    expect(getBagCountForTeam({ firstAidBagCount: "6" })).toBe(6)
  })

  it("falls back to 3 for out-of-range or non-numeric values", () => {
    expect(getBagCountForTeam({ firstAidBagCount: "0" })).toBe(3)
    expect(getBagCountForTeam({ firstAidBagCount: "7" })).toBe(3)
    expect(getBagCountForTeam({ firstAidBagCount: "abc" })).toBe(3)
  })
})

describe("getFirstAidBags", () => {
  it("returns only bags up to the team's bag count, normalizing holders", async () => {
    vi.stubGlobal(
      "fetch",
      jsonFetch({
        bag1: { name: "Pekka", lastSeenAt: "2026-01-01" },
        bag2: null,
        bag3: { name: "Should be ignored", lastSeenAt: "2026-01-02" },
      })
    )

    const result = await getFirstAidBags("team-1", { firstAidBagCount: "2" })

    expect(result).toEqual({
      bag1: { name: "Pekka", lastSeenAt: "2026-01-01" },
      bag2: null,
    })
    expect(result).not.toHaveProperty("bag3")
  })
})

describe("setBagHolder", () => {
  it("trims the name and PATCHes the bag holder", async () => {
    const fetchMock = jsonFetch({ bag1: { name: "Pekka", lastSeenAt: "2026-01-01" } })
    vi.stubGlobal("fetch", fetchMock)

    await setBagHolder("team-1", 1, "  Pekka  ", { firstAidBagCount: "3" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/first-aid-bags",
      expect.objectContaining({ method: "PATCH" })
    )
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({ teamId: "team-1", bagNumber: 1, holder: { name: "Pekka" } })
  })

  it("does not PATCH when the bag number is out of range", async () => {
    const fetchMock = jsonFetch({})
    vi.stubGlobal("fetch", fetchMock)

    await setBagHolder("team-1", 5, "Pekka", { firstAidBagCount: "3" })

    // Only the getFirstAidBags GET fires, never a PATCH.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1]).toBeUndefined()
  })
})
