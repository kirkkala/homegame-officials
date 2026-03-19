/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthActionButton } from "@/components/auth-action-button"

const mockUseSession = jest.fn()
const mockSignOut = jest.fn()

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

describe("AuthActionButton", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders nothing while session is loading", () => {
    mockUseSession.mockReturnValue({ data: undefined, status: "loading" })

    const { container } = render(<AuthActionButton />)

    expect(container.firstChild).toBeNull()
  })

  it("shows logout when user is signed in", async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { email: "a@b.c" } },
      status: "authenticated",
    })
    mockSignOut.mockResolvedValue(undefined)

    render(<AuthActionButton />)

    const btn = screen.getByRole("button", { name: /Kirjaudu ulos/i })
    await user.click(btn)

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" })
  })

  it("shows login link when unauthenticated", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" })

    render(<AuthActionButton />)

    const link = screen.getByRole("link", { name: /Kirjaudu/i })
    expect(link).toHaveAttribute("href", "/kirjaudu")
  })

  it("returns null when logoutOnly and unauthenticated", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" })

    const { container } = render(<AuthActionButton logoutOnly />)

    expect(container.firstChild).toBeNull()
  })

  it("calls onAfterAction when logging out", async () => {
    const user = userEvent.setup()
    const onAfterAction = jest.fn()
    mockUseSession.mockReturnValue({
      data: { user: { email: "a@b.c" } },
      status: "authenticated",
    })

    render(<AuthActionButton onAfterAction={onAfterAction} />)

    await user.click(screen.getByRole("button", { name: /Kirjaudu ulos/i }))

    expect(onAfterAction).toHaveBeenCalled()
  })
})
