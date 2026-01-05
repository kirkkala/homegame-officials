"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SettingsIcon from "@mui/icons-material/Settings"
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball"
import packageJson from "../../package.json"

const PAGES = [
  { path: "/", label: "Etusivu" },
  { path: "/kayttoohjeet", label: "Käyttöohjeet" },
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
          <IconButton component={Link} href={backHref} edge="start" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <SportsBasketballIcon color="primary" sx={{ mr: 1.5 }} />
        )}
        <Stack sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        {action}
      </Toolbar>
    </AppBar>
  )
}

export function MainHeader() {
  const pathname = usePathname()

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <SportsBasketballIcon color="primary" sx={{ mr: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" component="h1" fontWeight="bold">
            Kotipelien toimitsijat
          </Typography>
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
        <Tabs
          value={PAGES.some((p) => p.path === pathname) ? pathname : false}
          component="nav"
          sx={{ mr: 2 }}
        >
          {PAGES.map((page) => (
            <Tab
              key={page.path}
              label={page.label}
              value={page.path}
              href={page.path}
              component={Link}
              sx={{
                textTransform: "none",
                textDecoration: "none",
                fontWeight: pathname === page.path ? 700 : 400,
                minWidth: "auto",
                px: 2,
                "&:hover": {
                  textDecoration: "none",
                },
              }}
            />
          ))}
        </Tabs>
        <Button component={Link} href="/hallinta" variant="contained" startIcon={<SettingsIcon />}>
          Hallinta
        </Button>
      </Toolbar>
    </AppBar>
  )
}
