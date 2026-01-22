"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Box,
  Chip,
  Tab,
  Tabs,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Link as MuiLink,
} from "@mui/material"
import {
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  SportsBasketball as SportsBasketballIcon,
} from "@mui/icons-material"
import { AuthActionButton } from "./auth-action-button"
import { TeamSelector } from "./team-selector"
import { useTeam } from "./team-context"
import packageJson from "../../package.json"

type PageItem = {
  path: string
  label: string
  icon: typeof HomeIcon
  requiresAuth?: boolean
}

const PAGES: PageItem[] = [
  { path: "/", label: "Etusivu", icon: HomeIcon },
  { path: "/kayttoohjeet", label: "Käyttöohjeet", icon: HelpOutlineIcon },
  { path: "/hallinta", label: "Hallinta", icon: SettingsIcon, requiresAuth: true },
]

export function MainHeader() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { selectedTeam } = useTeam()
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"
  const visiblePages = PAGES.filter((page) => !page.requiresAuth || !!user)

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  const title = "Kotipelien toimitsijat"

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          {/* Mobile: hamburger menu */}
          <IconButton edge="start" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          <MuiLink href="/" color="inherit" sx={{ textDecoration: "none" }}>
            <SportsBasketballIcon color="primary" sx={{ mr: 1.5, fontSize: { xs: 24, sm: 28 } }} />
          </MuiLink>
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minWidth: 0,
              height: "100%",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, gap: 1 }}>
              <Typography
                variant="h6"
                component="h1"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                <MuiLink href="/" color="inherit" sx={{ textDecoration: "none" }}>
                  {title}
                </MuiLink>
              </Typography>
              {/* Version chip */}
              <Chip
                label={`v${packageJson.version}`}
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            {selectedTeam && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {selectedTeam.name}
              </Typography>
            )}
          </Box>

          {/* Desktop: tabs navigation */}
          <Tabs
            value={visiblePages.some((p) => p.path === pathname) ? pathname : false}
            component="nav"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {visiblePages.map((page) => (
              <Tab
                key={page.path}
                label={page.label}
                value={page.path}
                href={page.path}
                component={Link}
                icon={<page.icon />}
                iconPosition="start"
                sx={{ fontWeight: pathname === page.path ? 700 : 400, px: 2 }}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <SportsBasketballIcon />
              <Typography variant="h6" fontWeight="bold">
                Toimitsijat
              </Typography>
            </Stack>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: "inherit" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <TeamSelector fullWidth />
          </Box>

          <Divider />

          <List sx={{ pt: 1 }}>
            {visiblePages.map((page) => {
              const Icon = page.icon
              const isActive = pathname === page.path
              return (
                <ListItem key={page.path} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={page.path}
                    onClick={toggleDrawer(false)}
                    selected={isActive}
                  >
                    <ListItemIcon>
                      <Icon color={isActive ? "primary" : "inherit"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={page.label}
                      slotProps={{ primary: { fontWeight: isActive ? 700 : 400 } }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>

          {!authLoading && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <AuthActionButton
                  fullWidth
                  onAfterAction={toggleDrawer(false)}
                  sx={{ justifyContent: "flex-start" }}
                />
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  )
}
