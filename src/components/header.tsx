"use client"

import {
  Close as CloseIcon,
  HelpOutlineOutlined as HelpIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material"
import type { Theme } from "@mui/material/styles"
import { useTheme } from "@mui/material/styles"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import packageJson from "../../package.json"
import { LogoutButton, logout } from "./logout-button"
import { TeamSelector } from "./team-selector"

type PageItem = {
  path: string
  label: string
  icon: typeof HomeIcon
  requiresAuth?: boolean
}

const navTabSx = {
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    bgcolor: "text.secondary",
    borderRadius: 1,
    transform: "scaleX(0)",
    transition: "transform 0.2s ease",
    transformOrigin: "center",
  },
  "&:hover:not(.Mui-selected)::after": {
    transform: "scaleX(1)",
  },
}

const navListItemSx = (theme: Theme) => {
  const selectedBg = theme.alpha(theme.palette.primary.main, 0.2)

  return {
    borderRadius: 1,
    "& .MuiListItemIcon-root": {
      minWidth: 36,
    },
    "&:hover:not(.Mui-selected)": {
      bgcolor: "grey.100",
    },
    "&.Mui-selected": {
      bgcolor: selectedBg,
      color: "primary.main",
      "& .MuiListItemIcon-root": {
        color: "primary.main",
      },
    },
    "&.Mui-selected:hover": {
      bgcolor: selectedBg,
    },
  }
}

const navTabsSx = {
  "& .MuiTab-root": {
    ...navTabSx,
    minWidth: { sm: 48, md: 90 },
    px: { sm: 1, md: 2 },
  },
}

const PAGES: PageItem[] = [
  { path: "/", label: "Etusivu", icon: HomeIcon },
  { path: "/ensiapulaukut", label: "EA", icon: MedicalServicesIcon },
  { path: "/kayttoohjeet", label: "Ohjeet", icon: HelpIcon },
  { path: "/hallinta", label: "Hallinta", icon: SettingsIcon, requiresAuth: true },
]

export function MainHeader() {
  const pathname = usePathname()
  const theme = useTheme()
  const showTabLabels = useMediaQuery(theme.breakpoints.up("md"))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"
  const visiblePages = PAGES.filter((page) => !page.requiresAuth || !!user)

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  const handleLogout = () => {
    void logout()
    setDrawerOpen(false)
  }

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>
        <Box sx={{ maxWidth: 1105, mx: "auto", width: "100%" }}>
          <Toolbar sx={{ minHeight: { xs: 64, sm: 96 } }}>
            {/* Mobile: hamburger menu */}
            <IconButton edge="start" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>

            <MuiLink
              component={Link}
              href="/"
              color="inherit"
              sx={{ textDecoration: "none", display: "inline-flex", mt: 1, mr: 2, mb: 0, ml: 1 }}
            >
              <Image
                src="/logo.png"
                alt="HMKY logo"
                width={40}
                height={40}
                priority
                sizes="40px"
                className="header-logo"
              />
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
                  noWrap
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  <MuiLink href="/" color="inherit" sx={{ textDecoration: "none" }}>
                    Kotipelien toimitsijat
                  </MuiLink>
                </Typography>
                {/* Version chip */}
                <Link
                  href="https://github.com/kirkkala/homegame-officials/releases"
                  target="_blank"
                  rel="noopener"
                >
                  <Chip
                    label={`v${packageJson.version}`}
                    size="small"
                    sx={{
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      "&:hover": {
                        fontWeight: 700,
                      },
                    }}
                  />
                </Link>
              </Box>
              {/* Desktop: team selector below page name (hidden on mobile - use hamburger menu) */}
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  mt: 1,
                  scale: 0.85,
                  transformOrigin: "left center",
                }}
              >
                <TeamSelector size="small" compact />
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignSelf: "flex-end",
                alignItems: "center",
              }}
            >
              <Tabs
                value={visiblePages.some((page) => page.path === pathname) ? pathname : false}
                component="nav"
                sx={navTabsSx}
              >
                {visiblePages.map((page) => (
                  <Tab
                    key={page.path}
                    label={showTabLabels ? page.label : undefined}
                    value={page.path}
                    href={page.path}
                    component={Link}
                    icon={<page.icon />}
                    iconPosition={showTabLabels ? "start" : undefined}
                    aria-label={page.label}
                    sx={{ fontWeight: pathname === page.path ? 700 : 400 }}
                  />
                ))}
                {!authLoading && user && (
                  <LogoutButton variant="tab" showLabel={showTabLabels} email={user.email} />
                )}
              </Tabs>
              {!authLoading && !user && (
                <IconButton component={Link} href="/kirjaudu" aria-label="Kirjaudu" sx={{ ml: 1 }}>
                  <LoginIcon />
                </IconButton>
              )}
            </Box>
            {!authLoading && !user && (
              <IconButton
                component={Link}
                href="/kirjaudu"
                aria-label="Kirjaudu"
                sx={{ display: { xs: "inline-flex", sm: "none" }, ml: 1 }}
              >
                <LoginIcon />
              </IconButton>
            )}
            {!authLoading && user && (
              <IconButton
                aria-label="Logout"
                onClick={handleLogout}
                sx={{ display: { xs: "inline-flex", sm: "none" }, ml: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            )}
          </Toolbar>
        </Box>
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
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Menu
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

          <List sx={{ pt: 1, "& .MuiListItemButton-root": navListItemSx }}>
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
                      slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 400 } } }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
            {!authLoading && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  {user ? (
                    <LogoutButton
                      variant="list"
                      email={user.email}
                      onAfterAction={() => setDrawerOpen(false)}
                    />
                  ) : (
                    <ListItemButton component={Link} href="/kirjaudu" onClick={toggleDrawer(false)}>
                      <ListItemIcon>
                        <LoginIcon />
                      </ListItemIcon>
                      <ListItemText primary="Kirjaudu" />
                    </ListItemButton>
                  )}
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
