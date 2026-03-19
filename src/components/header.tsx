"use client"

import {
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Home as HomeIcon,
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
} from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import packageJson from "../../package.json"
import { AuthActionButton } from "./auth-action-button"
import { TeamSelector } from "./team-selector"

type PageItem = {
  path: string
  label: string
  icon: typeof HomeIcon
  requiresAuth?: boolean
}

const PAGES: PageItem[] = [
  { path: "/", label: "Etusivu", icon: HomeIcon },
  { path: "/ensiapulaukut", label: "Ensiapulaukut", icon: MedicalServicesIcon },
  { path: "/kayttoohjeet", label: "Käyttöohjeet", icon: HelpOutlineIcon },
  { path: "/hallinta", label: "Hallinta", icon: SettingsIcon, requiresAuth: true },
]

export function MainHeader() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"
  const visiblePages = PAGES.filter((page) => !page.requiresAuth || !!user)

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", width: "100%" }}>
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
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mt: 0, mb: 0 }}
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

            {/* Desktop: tabs navigation */}
            <Tabs
              value={visiblePages.some((page) => page.path === pathname) ? pathname : false}
              component="nav"
              sx={{ display: { xs: "none", sm: "flex" }, alignSelf: "flex-end" }}
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
            <AuthActionButton logoutOnly />
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
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 0, mb: 0 }}>
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
