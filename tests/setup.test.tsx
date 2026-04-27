import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

describe("test infrastructure (Wave 0 sanity)", () => {
  it("jsdom provides a document object", () => {
    expect(typeof document).toBe("object")
    expect(document.body).toBeDefined()
  })

  it("@testing-library/react can render a simple element", () => {
    render(<div data-testid="hello">hello world</div>)
    expect(screen.getByTestId("hello")).toHaveTextContent("hello world")
  })

  it("localStorage mock is fresh per test (write 1)", () => {
    localStorage.setItem("k", "v1")
    expect(localStorage.getItem("k")).toBe("v1")
  })

  it("localStorage mock is fresh per test (write 2)", () => {
    // If the mock were shared, this would still see "v1" from the prior test.
    expect(localStorage.getItem("k")).toBeNull()
  })

  it("@testing-library/jest-dom matchers are loaded", () => {
    render(<button disabled>x</button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
