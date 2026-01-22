"use client"

import {
  Box,
  Container,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  AssignmentAdd as AssignmentAddIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import { MainHeader } from "@/components/header"
import { Footer } from "@/components/footer"

export default function KaijttoohjeetPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Käyttöohjeet
        </Typography>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
            Mikä tämä on?
          </Typography>
          <Typography>
            Kotipelien toimitsijat -sovellus auttaa jakamaan Namikan kotipelien toimitsijavuoroja. Kirjautuminen ei ole pakollista — sitä tarvitsee vain jojo hallintaa
            varten.
          </Typography>
          <Typography>
            Timo Kirkkala askarteli applikaation harrasteprojektina AI:n kanssa että 
            toimitsijavuorojen kanssa säätäminen veisi vähemmän aikaa excelin parissa. Koodi on julkaistu
            avoimena lähdekoodina{" "}
            <Link
              href="https://github.com/kirkkala/homegame-officials"
              target="_blank"
              rel="noopener"
            >
              GitHubissa
            </Link>
            .
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
            Näin pääset alkuun
          </Typography>
          <Typography>
            Joukkueen vanhemmat voivat käyttää applikaatiota ilman kirjautumista.
          </Typography>
          <Typography>
            Jojo kirjautuu sisään ja hallitsee joukkuetta: luo joukkueen, lisää pelaajat ja ottelut{" "}
            <Link href="https://elsa-myclub.hnmky.fi/" target="_blank" rel="noopener">
              eLSA → MyClub Muuntaja
            </Link>{" "}
            appilla tehdystä excel-tiedostosta.
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon>
                <PersonAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Valitse joukkue"
                secondary="Etusivulla valitse joukkue, jonka ottelut haluat nähdä. Valittu joukkue tallentuu selaimen välimuistiin."
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon>
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Valitse ottelu ja jaa vuorot"
                secondary="Valitse kotipelille eSCO- ja kellovuoroon pelaajan vastuu. Tämän pelaajan vanhemmat ovat vastuussa toimitsijavuorosta. Joukkueenjohtajalta voi pyytää juniorin poolista tekemään toimitsijavuoron."
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon>
                <AssignmentAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Vahvista vuoro"
                secondary='Kun vuoro on sovittu, klikkaa "Odottaa vahvistusta" ja merkitse hoitaako vuoron huoltaja vai juniori poolista.'
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="4. Seuraa tilannetta"
                secondary="Vahvistetut vuorot näkyvät vihreänä, odottavat oranssina."
              />
            </ListItem>
          </List>
        </Paper>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
            Tietosuojaseloste
          </Typography>
          <Typography>
            Kirjautuneen käyttäjän sähköpostiosoite on tallennettu tietokantaan. Tietoja ei
            luovuteta kolmansille osapuolille. Palvelimet sijaitsevat EU-alueella AWS Tukholman
            datakeskuksessa. Hosting on toteutettu{" "}
            <Link href="https://vercel.com/" target="_blank" rel="noopener">
              Vercelin
            </Link>{" "}
            avulla. Kirjautuminen on toistaiseksi mahdollista vain Google-tilillä.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
