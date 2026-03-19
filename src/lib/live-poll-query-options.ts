const POLL_MS = 10_000

/**
 * Poll team lists while the tab is visible; pause in the background to reduce
 * network/battery use. Rely on default refetchOnWindowFocus when returning to the tab.
 */
// biome-ignore lint/suspicious/noExplicitAny: Query<T> is invariant; any matches all useQuery overloads
export function liveListRefetchInterval(_query: any): number | false {
  if (typeof document === "undefined") return false
  return document.visibilityState === "visible" ? POLL_MS : false
}

/** Use with useQuery for games/players lists that should stay fresh on the home view. */
export const liveTeamListQueryOptions = {
  refetchInterval: liveListRefetchInterval,
  refetchIntervalInBackground: false,
} as const
