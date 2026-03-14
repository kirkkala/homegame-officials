"use client"

import { Box, Container, Link, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import NextLink from "next/link"
import { Footer } from "@/components/footer"
import { GamesList } from "@/components/games-list"
import { MainHeader } from "@/components/header"
import { useTeam } from "@/components/team-context"

export default function Home() {
  const { selectedTeam } = useTeam()

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {!selectedTeam && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Typography component="h3" variant="h6" gutterBottom>
              Kotipelien toimitsijat -appi
            </Typography>

            <Typography>
              Kotipelien toimitsijat -appi on työkalu, jolla Namikan joukkueenjohtaja voi jakaa ja
              hallinnoida kotipelien toimitsijavuorot yhdessä joukkueen vanhempien kanssa.
            </Typography>
            <Typography>
              Pelaajien vanhemmat voivat käyttää sovellusta ilman kirjautumista. Valitse joukkueesi
              alta tai lue lisää{" "}
              <Link component={NextLink} href="/kayttoohjeet">
                käyttöohjeet
              </Link>{" "}
              -sivulta.
            </Typography>
          </Paper>
        )}
        <GamesList />
      </Container>
      <Footer />
    </Box>
  )
}
