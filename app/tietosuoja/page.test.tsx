/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react"
import TietosuojaPage from "./page"

jest.mock("@/components/header", () => ({
  MainHeader: () => <div data-testid="main-header" />,
}))

jest.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer" />,
}))

describe("TietosuojaPage", () => {
  it("renders the privacy policy page with title", () => {
    render(<TietosuojaPage />)

    expect(screen.getByRole("heading", { name: /tietosuojaseloste/i })).toBeInTheDocument()
  })
})
