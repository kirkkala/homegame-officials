/** Parses JSON from fetch response, throws with API error message if not ok. */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    let error = "Pyyntö epäonnistui"
    try {
      const data = JSON.parse(text)
      error = data.error ?? error
    } catch {
      // Non-JSON body (HTML, plain text, etc.) – use raw text if it looks readable
      const trimmed = text.trim()
      if (trimmed.length > 0 && trimmed.length < 500 && !trimmed.startsWith("<")) {
        error = trimmed
      }
    }
    throw new Error(error)
  }
  return res.json()
}
