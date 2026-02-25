import "@testing-library/jest-dom"

// Suppress noisy MUI warnings in tests (anchorEl not in document during menu open)
const originalWarn = console.warn
console.warn = (...args) => {
  const message = args[0]
  if (
    typeof message === "string" &&
    message.includes("MUI: The `anchorEl` prop provided to the component is invalid")
  ) {
    return
  }
  originalWarn.apply(console, args)
}
