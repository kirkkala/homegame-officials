/// <reference types="@testing-library/jest-dom/vitest" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import * as storage from "@/lib/storage"
import AdminPage from "./page"

const mockUseSession = vi.fn()

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}))

vi.mock("@/components/header", () => ({
  MainHeader: () => <div data-testid="main-header" />,
}))

vi.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer" />,
}))

vi.mock("@/lib/storage", () => ({
  getUsers: vi.fn(),
}))

const renderAdminPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPage />
    </QueryClientProvider>
  )
}

describe("AdminPage", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "admin@example.com", isAdmin: true } },
      status: "authenticated",
    })
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("shows a loading spinner while the session is loading", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading" })
    renderAdminPage()

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(storage.getUsers).not.toHaveBeenCalled()
  })

  it("blocks non-admins with a message and back link", () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "user@example.com", isAdmin: false } },
      status: "authenticated",
    })
    renderAdminPage()

    expect(screen.getByText(/vain järjestelmän pääkäyttäjälle/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /siirry joukkueen asetuksiin/i })).toHaveAttribute(
      "href",
      "/hallinta"
    )
    expect(storage.getUsers).not.toHaveBeenCalled()
  })

  it("shows an empty state when there are no registered users", async () => {
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    renderAdminPage()

    expect(await screen.findByText("Ei rekisteröityneitä käyttäjiä.")).toBeInTheDocument()
    expect(screen.getByText("Rekisteröityneet käyttäjät (0)")).toBeInTheDocument()
  })

  it("lists registered users with their managed teams", async () => {
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "u1", email: "coach@example.com", teams: [{ id: "team-1", name: "HNMKY T14 Stadi" }] },
      { id: "u2", email: "orphan@example.com", teams: [] },
    ])
    renderAdminPage()

    expect(await screen.findByText("coach@example.com")).toBeInTheDocument()
    expect(screen.getByText("HNMKY T14 Stadi")).toBeInTheDocument()
    expect(screen.getByText("orphan@example.com")).toBeInTheDocument()
    expect(screen.getByText("ei hallittavia joukkueita")).toBeInTheDocument()
    expect(screen.getByText("Rekisteröityneet käyttäjät (2)")).toBeInTheDocument()
  })

  it("shows multiple teams for a user managing more than one team", async () => {
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "u1",
        email: "multi@example.com",
        teams: [
          { id: "team-1", name: "HNMKY T14 Stadi" },
          { id: "team-2", name: "HNMKY P13 Stadi" },
        ],
      },
    ])
    renderAdminPage()

    expect(await screen.findByText("multi@example.com")).toBeInTheDocument()
    expect(screen.getByText("HNMKY T14 Stadi")).toBeInTheDocument()
    expect(screen.getByText("HNMKY P13 Stadi")).toBeInTheDocument()
  })
})
