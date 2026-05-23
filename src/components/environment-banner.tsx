import { Alert } from "@mui/material"
import { getEnvironmentInfo } from "@/lib/environment"

export function EnvironmentBanner() {
  const environment = getEnvironmentInfo()

  if (!environment) {
    return null
  }

  return (
    <Alert
      severity={environment.severity}
      variant="filled"
      sx={{
        borderRadius: 0,
        justifyContent: "center",
        py: 0.75,
        boxShadow: 1,
      }}
    >
      {environment.label}
    </Alert>
  )
}
