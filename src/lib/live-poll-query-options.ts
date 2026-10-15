const LIST_POLL_MS = 10_000
const GAME_POLL_MS = 3_000

/**
 * Poll while the tab is visible; pause in the background to reduce network/battery use.
 * Rely on default refetchOnWindowFocus when returning to the tab.
 */
function liveRefetchInterval(pollMs: number) {
  // biome-ignore lint/suspicious/noExplicitAny: Query<T> is invariant; any matches all useQuery overloads
  return (_query: any): number | false => {
    if (typeof document === "undefined") return false
    return document.visibilityState === "visible" ? pollMs : false
  }
}

export const liveListRefetchInterval = liveRefetchInterval(LIST_POLL_MS)

/** Use with useQuery for games/players lists that should stay fresh on the home view. */
export const liveTeamListQueryOptions = {
  refetchInterval: liveListRefetchInterval,
  refetchIntervalInBackground: false,
} as const

/** Faster poll for a live game page (rebound counting). */
export const liveGameQueryOptions = {
  refetchInterval: liveRefetchInterval(GAME_POLL_MS),
  refetchIntervalInBackground: false,
} as const
