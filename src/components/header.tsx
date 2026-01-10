"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SettingsIcon from "@mui/icons-material/Settings"
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball"
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from "@mui/icons-material/Home"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import CloseIcon from "@mui/icons-material/Close"
import packageJson from "../../package.json"

const PAGES = [
  { path: "/", label: "Etusivu", icon: HomeIcon },
  { path: "/kayttoohjeet", label: "Käyttöohjeet", icon: HelpOutlineIcon },
  { path: "/hallinta", label: "Hallinta", icon: SettingsIcon },
] as const

type HeaderProps = {
  title: string
  subtitle: string
  backHref?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, backHref, action }: HeaderProps) {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {backHref ? (
          <IconButton component={Link} href={backHref} edge="start" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <SportsBasketballIcon color="primary" sx={{ mr: 1 }} />
        )}
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" component="h1" fontWeight="bold" noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        </Stack>
        {action}
      </Toolbar>
    </AppBar>
  )
}

const versionChipSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  fontWeight: 600,
  fontSize: "0.7rem",
}

export function MainHeader() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {/* Mobile: hamburger menu */}
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 1, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <SportsBasketballIcon color="primary" sx={{ mr: 1.5 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Typography variant="h6" component="h1" fontWeight="bold" noWrap>
              Kotipelien toimitsijat
            </Typography>
            {/* Desktop: version chip */}
            <Chip
              label={`v${packageJson.version}`}
              size="small"
              sx={{ ...versionChipSx, display: { xs: "none", sm: "flex" } }}
            />
          </Box>

          {/* Desktop: tabs navigation */}
          <Tabs
            value={PAGES.some((p) => p.path === pathname) ? pathname : false}
            component="nav"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {PAGES.map((page) => (
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

          <List sx={{ pt: 1 }}>
            {PAGES.map((page) => {
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

          <Box sx={{ p: 2 }}>
            <Chip label={`v${packageJson.version}`} size="small" sx={versionChipSx} />
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
