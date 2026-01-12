"use client"

import { QueryClient, QueryClientProvider, useIsMutating } from "@tanstack/react-query"
import { useState } from "react"
import { LinearProgress, Box } from "@mui/material"

function GlobalLoadingIndicator() {
  const isMutating = useIsMutating()
  if (!isMutating) return null

  return (
    <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <LinearProgress />
    </Box>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingIndicator />
      {children}
    </QueryClientProvider>
  )
}
