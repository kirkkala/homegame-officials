/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/footer"

describe("Footer", () => {
  it("renders attribution and external links", () => {
    render(<Footer />)

    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Timo Kirkkala/i })).toHaveAttribute(
      "href",
      "https://github.com/kirkkala"
    )
    expect(screen.getByRole("link", { name: /GitHub/i })).toHaveAttribute(
      "href",
      "https://github.com/kirkkala/homegame-officials"
    )
  })

  it("links to privacy page", () => {
    render(<Footer />)

    const privacy = screen.getByRole("link", { name: /Tietosuojaseloste/i })
    expect(privacy).toHaveAttribute("href", "/tietosuoja")
  })
})
