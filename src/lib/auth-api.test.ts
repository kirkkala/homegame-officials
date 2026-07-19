import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import {
  forbiddenResponse,
  requireAuthUser,
  requireTeamManager,
  unauthorizedResponse,
} from "@/lib/auth-api"
import { createUser, getUserByEmail, isUserTeamManager } from "@/lib/db"

// ADMIN_EMAIL is captured at module load, so set it before auth-api is imported.
// Emails are built by concatenation to keep a real address in the source.
const { adminEmail } = vi.hoisted(() => {
  const adminEmail = ["admin", "club.test"].join("@")
  process.env.ADMIN_EMAIL = adminEmail
  process.env.AUTH_SECRET = "test-secret"
  return { adminEmail }
})

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }))
vi.mock("@/lib/db", () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
  isUserTeamManager: vi.fn(),
}))

const memberEmail = ["member", "club.test"].join("@")
const fakeRequest = {} as NextRequest

beforeEach(() => {
  vi.clearAllMocks()
})

describe("unauthorizedResponse / forbiddenResponse", () => {
  it("returns 401 with an Unauthorized error", async () => {
    const res = unauthorizedResponse()
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" })
  })

  it("returns 403 with a Forbidden error", async () => {
    const res = forbiddenResponse()
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({ error: "Forbidden" })
  })
})

describe("requireAuthUser", () => {
  it("returns a 401 response when there is no token", async () => {
    vi.mocked(getToken).mockResolvedValue(null)

    const result = await requireAuthUser(fakeRequest)

    expect("response" in result).toBe(true)
    if ("response" in result) expect(result.response.status).toBe(401)
  })

  it("returns the existing user, flagged non-admin for a regular email", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: memberEmail } as never)
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u-1", email: memberEmail } as never)

    const result = await requireAuthUser(fakeRequest)

    expect(result).toEqual({ user: { id: "u-1", email: memberEmail, isAdmin: false } })
    expect(createUser).not.toHaveBeenCalled()
  })

  it("flags the configured ADMIN_EMAIL as admin (case-insensitive)", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: adminEmail.toUpperCase() } as never)
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u-admin", email: adminEmail } as never)

    const result = await requireAuthUser(fakeRequest)

    expect("user" in result && result.user.isAdmin).toBe(true)
  })

  it("creates the user on first login when none exists", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: memberEmail } as never)
    vi.mocked(getUserByEmail).mockResolvedValue(undefined as never)
    vi.mocked(createUser).mockResolvedValue({ id: "new-id", email: memberEmail } as never)

    const result = await requireAuthUser(fakeRequest)

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: memberEmail, id: expect.any(String) })
    )
    expect("user" in result && result.user.id).toBe("new-id")
  })
})

describe("requireTeamManager", () => {
  it("propagates the 401 when the user is not authenticated", async () => {
    vi.mocked(getToken).mockResolvedValue(null)

    const result = await requireTeamManager(fakeRequest, "team-1")

    expect("response" in result && result.response.status).toBe(401)
    expect(isUserTeamManager).not.toHaveBeenCalled()
  })

  it("allows an admin without checking team membership", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: adminEmail } as never)
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u-admin", email: adminEmail } as never)

    const result = await requireTeamManager(fakeRequest, "team-1")

    expect("user" in result).toBe(true)
    expect(isUserTeamManager).not.toHaveBeenCalled()
  })

  it("allows a non-admin who manages the team", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: memberEmail } as never)
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u-1", email: memberEmail } as never)
    vi.mocked(isUserTeamManager).mockResolvedValue(true)

    const result = await requireTeamManager(fakeRequest, "team-1")

    expect("user" in result).toBe(true)
    expect(isUserTeamManager).toHaveBeenCalledWith("u-1", "team-1")
  })

  it("returns 403 for a non-admin who does not manage the team", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: memberEmail } as never)
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u-1", email: memberEmail } as never)
    vi.mocked(isUserTeamManager).mockResolvedValue(false)

    const result = await requireTeamManager(fakeRequest, "team-1")

    expect("response" in result && result.response.status).toBe(403)
  })
})
