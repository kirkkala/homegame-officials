"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Menu,
  MenuItem,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Home as HomeIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  SportsBasketball as SportsBasketballIcon,
} from "@mui/icons-material"
import { TeamSelector } from "./team-selector"
import { useTeam } from "./team-context"
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
  const [teamMenuAnchor, setTeamMenuAnchor] = useState<null | HTMLElement>(null)
  const { teams, selectedTeam, selectTeam, isLoading } = useTeam()

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open)

  const handleTeamMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (teams.length > 1) {
      setTeamMenuAnchor(event.currentTarget)
    }
  }

  const handleTeamMenuClose = () => {
    setTeamMenuAnchor(null)
  }

  const handleTeamSelect = (teamId: string) => {
    selectTeam(teamId)
    handleTeamMenuClose()
  }

  // Get the title based on selected team
  const getTitle = () => {
    if (isLoading) return "Kotipelien toimitsijat"
    if (!selectedTeam) return "Kotipelien toimitsijat"
    return `${selectedTeam.name}`
  }

  const getSubtitle = () => "Kotipelien toimitsijat"

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          {/* Mobile: hamburger menu */}
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 1, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <SportsBasketballIcon color="primary" sx={{ mr: 1.5, fontSize: { xs: 24, sm: 28 } }} />

          {/* Title with team name - clickable on desktop when multiple teams */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minWidth: 0,
              cursor: teams.length > 1 ? "pointer" : "default",
            }}
            onClick={handleTeamMenuOpen}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="h6"
                component="h1"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {getTitle()}
              </Typography>
              {teams.length > 1 && !isLoading && (
                <KeyboardArrowDownIcon
                  sx={{
                    fontSize: 20,
                    color: "text.secondary",
                    display: { xs: "none", sm: "block" },
                  }}
                />
              )}
            </Box>
            {selectedTeam && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {getSubtitle()}
              </Typography>
            )}
          </Box>

          {/* Desktop: version chip */}
          <Chip
            label={`v${packageJson.version}`}
            size="small"
            sx={{ ...versionChipSx, display: { xs: "none", md: "flex" }, mr: 2 }}
          />

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

      {/* Desktop: Team switcher menu */}
      <Menu
        anchorEl={teamMenuAnchor}
        open={Boolean(teamMenuAnchor)}
        onClose={handleTeamMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {teams.map((team) => (
          <MenuItem
            key={team.id}
            onClick={() => handleTeamSelect(team.id)}
            selected={team.id === selectedTeam?.id}
          >
            {team.name}
          </MenuItem>
        ))}
      </Menu>

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
            <TeamSelector showCreateButton fullWidth />
          </Box>

          <Divider />

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
