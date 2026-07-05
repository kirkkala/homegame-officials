import { parseJsonResponse } from "@/lib/api"

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  })

describe("parseJsonResponse", () => {
  it("returns parsed JSON for an ok response", async () => {
    const res = jsonResponse({ id: 1, name: "Tigers" })
    await expect(parseJsonResponse(res)).resolves.toEqual({ id: 1, name: "Tigers" })
  })

  it("throws the API error message from a JSON error body", async () => {
    const res = jsonResponse({ error: "Joukkuetta ei löytynyt" }, { status: 404 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Joukkuetta ei löytynyt")
  })

  it("throws the default message when the JSON error body has no error field", async () => {
    const res = jsonResponse({ message: "nope" }, { status: 500 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Pyyntö epäonnistui")
  })

  it("uses a short, readable plain-text body as the error message", async () => {
    const res = new Response("Kentän arvo puuttuu", { status: 400 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Kentän arvo puuttuu")
  })

  it("falls back to the default message for an HTML error body", async () => {
    const res = new Response("<!DOCTYPE html><html>Server Error</html>", { status: 500 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Pyyntö epäonnistui")
  })

  it("falls back to the default message for an oversized text body", async () => {
    const res = new Response("x".repeat(600), { status: 500 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Pyyntö epäonnistui")
  })

  it("falls back to the default message for an empty body", async () => {
    const res = new Response("", { status: 500 })
    await expect(parseJsonResponse(res)).rejects.toThrow("Pyyntö epäonnistui")
  })
})
