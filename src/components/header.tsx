"use client"

import Link from "next/link"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SettingsIcon from "@mui/icons-material/Settings"
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball"

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
  return (
    <Header
      title="Kotipelien toimitsijat"
      subtitle="Hallitse pöytäkirja- ja kellovuorot"
      action={
        <Button component={Link} href="/hallinta" variant="contained" startIcon={<SettingsIcon />}>
          Hallinta
        </Button>
      }
    />
  )
}
