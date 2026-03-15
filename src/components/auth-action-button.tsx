"use client"

import { Login as LoginIcon, Logout as LogoutIcon } from "@mui/icons-material"
import { Button, type SxProps, type Theme } from "@mui/material"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

type AuthActionButtonProps = {
  size?: "small" | "medium"
  fullWidth?: boolean
  logoutOnly?: boolean
  loginVariant?: "text" | "contained" | "outlined"
  sx?: SxProps<Theme>
  onAfterAction?: () => void
}

export function AuthActionButton({
  size = "small",
  fullWidth = false,
  logoutOnly = false,
  loginVariant = "text",
  sx,
  onAfterAction,
}: AuthActionButtonProps) {
  const { data: session, status } = useSession()
  const user = session?.user

  if (status === "loading") {
    return null
  }

  if (user) {
    return (
      <Button
        onClick={() => {
          void signOut({ callbackUrl: "/" })
          onAfterAction?.()
        }}
        size={size}
        fullWidth={fullWidth}
        variant="text"
        endIcon={<LogoutIcon />}
        sx={{
          textTransform: "none",
          color: "text.secondary",
          "&:hover": { bgcolor: "transparent", color: "text.primary" },
          ...sx,
        }}
      >
        Kirjaudu ulos
      </Button>
    )
  }

  if (logoutOnly) {
    return null
  }

  return (
    <Button
      component={Link}
      href="/kirjaudu"
      size={size}
      fullWidth={fullWidth}
      variant={loginVariant}
      startIcon={<LoginIcon />}
      sx={{ textTransform: "none", ...sx }}
      onClick={onAfterAction}
    >
      Kirjaudu
    </Button>
  )
}
