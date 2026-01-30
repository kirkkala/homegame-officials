import { formatDate, slugify } from "@/lib/utils"

describe("utils", () => {
  it("slugify removes accents and normalizes whitespace", () => {
    expect(slugify("  AaBbCc & # ÅåÄäÖö (20€)")).toBe("aabbcc-aaaaoo-20")
  })

  it("formatDate returns Finnish weekday when requested", () => {
    expect(formatDate("2026-01-30T23:59:00", { includeWeekday: true })).toBe("Perjantai 30.1.2026")
    expect(formatDate("1980-04-12T08:36:25", { includeWeekday: true })).toBe("Lauantai 12.4.1980")
  })
})
