"use client"

import { Box, Container, Link, Paper, Typography } from "@mui/material"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

export default function TietosuojaPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tietosuojaseloste
          </Typography>
          <Typography>
            Joukkueenjohtaja huolehtii, että pelaajien nimet ovat etu- tai lempinimiä. Näin tietoja
            ei voi helposti yhdistää henkilöllisyyteen. Kirjautuneen käyttäjän (joukkueenjohtaja)
            sähköpostiosoite tallennetaan tietokantaan.
          </Typography>
          <Typography>
            Kirjautuminen on toteutettu Google autentikoinnin avulla, kirjautuminen vaatii
            Google-tilin. Kysy ylläpitäjältä, mikäli sinun tarvitsee kirjautua palveluun ja haluat
            käyttää jotain muuta kirjautumistapaa.
          </Typography>
          <Typography>
            Applikaatioon tallennettuja tietoja ei luovuteta kolmansille osapuolille.
            Hakukonenäkyvyys on estetty robots.txt-tiedoston avulla.
          </Typography>
          <Typography>
            Pilvipalvelu sijaitsee EU-alueella AWS Tukholman (applikaatio) ja AWS Frankfurtin
            (tietokanta) datakeskuksissa{" "}
            <Link href="https://vercel.com/" target="_blank" rel="noopener">
              Vercelin
            </Link>{" "}
            käyttöpalveluiden alla.
          </Typography>
          <Typography>
            Lisätietoja applikaation kehittäjältä voi kysellä sähköpostitse:{" "}
            <Link href="mailto:timo.kirkkala@gmail.com?subject=Kotipelin toimitsijat -applikaatio">
              timo.kirkkala@gmail.com
            </Link>
            .
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
