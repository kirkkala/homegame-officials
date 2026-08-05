"use client"

import { Logout as LogoutIcon } from "@mui/icons-material"
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  type TabProps,
  Typography,
} from "@mui/material"
import { signOut } from "next-auth/react"

export const logout = () => signOut({ callbackUrl: "/" })

type LogoutButtonProps = Partial<TabProps> & {
  variant: "tab" | "list"
  email?: string | null
  showLabel?: boolean
  onAfterAction?: () => void
}

export function LogoutButton({
  variant,
  email,
  showLabel = true,
  onAfterAction,
  ...tabProps
}: LogoutButtonProps) {
  const handleLogout = () => {
    void logout()
    onAfterAction?.()
  }

  if (variant === "list") {
    return (
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Kirjaudu ulos" secondary={email ?? undefined} />
      </ListItemButton>
    )
  }

  return (
    <Tab
      {...tabProps}
      onClick={handleLogout}
      aria-label="Kirjaudu ulos"
      icon={<LogoutIcon />}
      iconPosition={showLabel ? "start" : undefined}
      label={
        showLabel ? (
          <Stack sx={{ alignItems: "flex-start", lineHeight: 1.2 }}>
            <span>Kirjaudu ulos</span>
            {email && (
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "text.secondary", fontSize: "0.6rem", textTransform: "none", maxWidth: 180 }}
              >
                ({email})
              </Typography>
            )}
          </Stack>
        ) : undefined
      }
      sx={{ fontWeight: 400, ...tabProps.sx }}
    />
  )
}
