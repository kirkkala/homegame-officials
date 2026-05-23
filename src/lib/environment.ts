export type EnvironmentInfo = {
  label: string
  severity: "warning" | "info"
}

export function getEnvironmentInfo(): EnvironmentInfo | null {
  const vercelEnv = process.env.VERCEL_ENV

  if (vercelEnv === "production") {
    return null
  }

  if (vercelEnv === "preview") {
    const branch = process.env.VERCEL_GIT_COMMIT_REF
    return {
      label: branch ? `Preview: ${branch}` : "Preview",
      severity: "warning",
    }
  }

  if (vercelEnv === "development") {
    return {
      label: "Vercel development",
      severity: "info",
    }
  }

  if (process.env.NODE_ENV === "development") {
    return {
      label: "Local development",
      severity: "info",
    }
  }

  return null
}
