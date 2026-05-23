"use client"

import { Box, Container, Link, Stack, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import dynamic from "next/dynamic"
import NextLink from "next/link"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"
import { useTeam } from "@/components/team-context"
import { TeamSelector } from "@/components/team-selector"

const GamesList = dynamic(() => import("@/components/games-list").then((m) => m.GamesList), {
  loading: () => null,
})

export default function Home() {
  const { selectedTeam } = useTeam()

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {!selectedTeam && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h5">
                HNMKY kotipelien toimitsijat
              </Typography>

              <Typography>
                Namikan juniorijoukkueen jojo voi tämän sovelluksen avulla jakaa ja hallinnoida
                kotipelien toimitsijavuorot yhdessä pelaajien vanhempien kanssa. Sovelluksesta löytyy
                myös ratkaisu ensiapulaukkujen seurannalle.
              </Typography>
              <Typography>
                Sovelluksen käyttö ei vaadi kirjautumista muilta kuin joukkueenjohtajalta pelien
                hallinnoimisen osalta.
              </Typography>
              <Typography>
                Valitse joukkue tai lue lisää{" "}
                <Link component={NextLink} href="/kayttoohjeet">
                  käyttöohjeet
                </Link>{" "}
                -sivulta. Mikäli joukkueesi ei ole listalla, ota yhteyttä joukkueenjohtajaan.
              </Typography>
              <Box sx={{ pt: 2 }}>
                <TeamSelector />
              </Box>
            </Stack>
          </Paper>
        )}
        <GamesList />
      </Container>
      <Footer />
    </Box>
  )
}
