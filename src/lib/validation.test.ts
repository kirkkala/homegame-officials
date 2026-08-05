import {
  createGameSchema,
  createGamesSchema,
  createPlayerSchema,
  createTeamSchema,
  teamManagerSchema,
  updateBagHolderSchema,
  updateGameSchema,
  updateTeamSettingsSchema,
  validate,
} from "@/lib/validation"

const validGame = {
  divisionId: "div-1",
  homeTeam: "Tigers",
  awayTeam: "Lions",
  isHomeGame: true,
  date: "2026-01-30",
  time: "18:30",
  location: "Hall A",
}

describe("validation", () => {
  describe("validate helper", () => {
    it("returns parsed data on success", () => {
      const result = validate(createTeamSchema, { name: "Tigers" })
      expect(result).toEqual({ success: true, data: { name: "Tigers" } })
    })

    it("returns an error string on failure", () => {
      const result = validate(createTeamSchema, { name: "" })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(typeof result.error).toBe("string")
        expect(result.error.length).toBeGreaterThan(0)
      }
    })
  })

  describe("createTeamSchema", () => {
    it("trims the name", () => {
      const result = validate(createTeamSchema, { name: "  Tigers  " })
      expect(result).toEqual({ success: true, data: { name: "Tigers" } })
    })

    it("rejects an empty name", () => {
      expect(validate(createTeamSchema, { name: "" }).success).toBe(false)
    })

    it("rejects a name longer than 100 chars", () => {
      expect(validate(createTeamSchema, { name: "a".repeat(101) }).success).toBe(false)
    })
  })

  describe("createPlayerSchema", () => {
    it("accepts a name and teamId", () => {
      const result = validate(createPlayerSchema, { name: "Pekka", teamId: "team-1" })
      expect(result).toEqual({ success: true, data: { name: "Pekka", teamId: "team-1" } })
    })

    it("requires a teamId", () => {
      expect(validate(createPlayerSchema, { name: "Pekka" }).success).toBe(false)
    })
  })

  describe("createGameSchema", () => {
    it("accepts a valid game", () => {
      expect(validate(createGameSchema, validGame).success).toBe(true)
    })

    it("defaults divisionId and location to empty strings", () => {
      const { divisionId: _d, location: _l, ...rest } = validGame
      const result = validate(createGameSchema, rest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.divisionId).toBe("")
        expect(result.data.location).toBe("")
      }
    })

    it.each([
      ["2026-1-30", "single-digit month"],
      ["26-01-30", "two-digit year"],
      ["not-a-date", "non-date text"],
    ])("rejects invalid date %s (%s)", (date) => {
      expect(validate(createGameSchema, { ...validGame, date }).success).toBe(false)
    })

    it.each([
      ["8:30", "single-digit hour"],
      ["18:5", "single-digit minute"],
      ["18-30", "wrong separator"],
    ])("rejects invalid time %s (%s)", (time) => {
      expect(validate(createGameSchema, { ...validGame, time }).success).toBe(false)
    })

    it("requires a boolean isHomeGame", () => {
      expect(validate(createGameSchema, { ...validGame, isHomeGame: "yes" }).success).toBe(false)
    })
  })

  describe("createGamesSchema", () => {
    it("accepts a non-empty games array with a teamId", () => {
      const result = validate(createGamesSchema, { games: [validGame], teamId: "team-1" })
      expect(result.success).toBe(true)
    })

    it("rejects an empty games array", () => {
      expect(validate(createGamesSchema, { games: [], teamId: "team-1" }).success).toBe(false)
    })

    it("rejects more than 500 games", () => {
      const games = Array.from({ length: 501 }, () => validGame)
      expect(validate(createGamesSchema, { games, teamId: "team-1" }).success).toBe(false)
    })
  })

  describe("updateGameSchema", () => {
    it("accepts an empty object (all fields optional)", () => {
      expect(validate(updateGameSchema, {}).success).toBe(true)
    })

    it("accepts a valid official assignment", () => {
      const result = validate(updateGameSchema, {
        officials: {
          poytakirja: { playerName: "Pekka", handledBy: "guardian", confirmedBy: "Mom" },
          kello: null,
        },
      })
      expect(result.success).toBe(true)
    })

    it("accepts a hyokkaysaika (24s shot clock) assignment", () => {
      const result = validate(updateGameSchema, {
        officials: {
          hyokkaysaika: { playerName: "Aino", handledBy: "pool", confirmedBy: null },
        },
      })
      expect(result.success).toBe(true)
    })

    it("rejects an unknown handledBy value", () => {
      const result = validate(updateGameSchema, {
        officials: { poytakirja: { playerName: "Pekka", handledBy: "someone", confirmedBy: null } },
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateTeamSettingsSchema", () => {
    it("accepts a shot clock toggle on its own", () => {
      const result = validate(updateTeamSettingsSchema, { shotClockEnabled: true })
      expect(result).toEqual({ success: true, data: { shotClockEnabled: true } })
    })

    it("accepts first aid settings on their own", () => {
      const result = validate(updateTeamSettingsSchema, {
        firstAidBagsEnabled: true,
        firstAidBagCount: 3,
      })
      expect(result.success).toBe(true)
    })

    it("rejects an empty object (no settings provided)", () => {
      expect(validate(updateTeamSettingsSchema, {}).success).toBe(false)
    })

    it("rejects a non-boolean shotClockEnabled", () => {
      expect(validate(updateTeamSettingsSchema, { shotClockEnabled: "yes" }).success).toBe(false)
    })

    it.each([0, 7, 2.5])("rejects firstAidBagCount %s", (firstAidBagCount) => {
      expect(
        validate(updateTeamSettingsSchema, { firstAidBagsEnabled: true, firstAidBagCount }).success
      ).toBe(false)
    })
  })

  describe("teamManagerSchema", () => {
    const emailOf = (local: string, domain = "example.com") => `${local}@${domain}`

    it("accepts a valid email", () => {
      const email = emailOf("coach")
      expect(validate(teamManagerSchema, { email })).toEqual({ success: true, data: { email } })
    })

    it("lowercases a mixed-case email", () => {
      const result = validate(teamManagerSchema, { email: emailOf("Coach", "Example.COM") })
      expect(result).toEqual({ success: true, data: { email: emailOf("coach") } })
    })

    it("rejects an invalid email", () => {
      expect(validate(teamManagerSchema, { email: "not-an-email" }).success).toBe(false)
    })
  })

  describe("updateBagHolderSchema", () => {
    it("accepts a holder with a name", () => {
      const result = validate(updateBagHolderSchema, {
        teamId: "team-1",
        bagNumber: 3,
        holder: { name: "Pekka" },
      })
      expect(result.success).toBe(true)
    })

    it("accepts a null holder (clearing the bag)", () => {
      const result = validate(updateBagHolderSchema, {
        teamId: "team-1",
        bagNumber: 1,
        holder: null,
      })
      expect(result.success).toBe(true)
    })

    it.each([0, 7, 2.5])("rejects bagNumber %s", (bagNumber) => {
      expect(
        validate(updateBagHolderSchema, { teamId: "team-1", bagNumber, holder: null }).success
      ).toBe(false)
    })
  })
})
