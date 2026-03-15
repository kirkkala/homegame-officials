"use client"

import {
  AssignmentAdd as AssignmentAddIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
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
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

export default function KayttoohjeetPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Tietoja ja käyttöohjeet
          </Typography>
          <Typography component="h3" variant="h5" gutterBottom>
            Mikä tämä on?
          </Typography>
          <Typography>
            Kotipelien toimitsijat -sovellus auttaa jakamaan Namikan kotipelien toimitsijavuoroja.
            Kirjautuminen ei ole pakollista — sitä tarvitsee vain jojo hallintaa varten.
          </Typography>
          <Typography>
            Timo Kirkkala askarteli applikaation harrasteprojektina AI:n kanssa että
            toimitsijavuorojen kanssa säätäminen veisi vähemmän aikaa excelin parissa. Koodi on
            julkaistu avoimena lähdekoodina{" "}
            <Link
              href="https://github.com/kirkkala/homegame-officials"
              target="_blank"
              rel="noopener"
            >
              GitHubissa
            </Link>
            .
          </Typography>
          <Typography component="h3" variant="h5" gutterBottom>
            Näin pääset alkuun
          </Typography>
          <Typography>
            Joukkueenjohtaja luo joukkueen{" "}
            <Link href="https://elsa-myclub.hnmky.fi/" target="_blank" rel="noopener">
              eLSA → MyClub Muuntaja
            </Link>{" "}
            appilla tehdystä excel-tiedostosta sekä lisää pelaajat ja merkitsee kotiottelut
            hallintapaneelin kautta.
          </Typography>
          <Typography>Joukkueen vanhemmat käyttävät applikaatiota ilman kirjautumista.</Typography>
          <List className="steps-list">
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <PersonAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Valitse joukkue"
                secondary="Valitse oma joukkueesi. Valinta tallentuu selaimesi välimuistiin ja joukkueen nimi säilyy selaimen URL osoitteessa joten voit jakaa linkin jolla pääsee suoraan oikean joukkueen peleihin."
                className="steps-list-text"
              />
            </ListItem>
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Jaa toimitsijavuorot"
                secondary='Valitse pelin eSCO- ja kellovuoron vastuu painamalla "Valitse pelaaja...". Avautuvasta pudotusvalikosta valitse pelaaja kenen huoltajille toimitsijavuoron vastuu halutaan osoittaa.'
                className="steps-list-text"
              />
            </ListItem>
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <AssignmentAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Vahvista vuoro"
                secondary='Kun toimitsijavuoro odottaa vahvistusta, joko joukkueenjohtaja tai kyseisen pelaajan huoltaja vahvistaa vuoron painamalla "Vahvista" painiketta ja valitsee hoitaako vanhempi (huoltaja) itse vuoron vai pyydetäänkö tehtävän tekijäksi juniori joukkueenjohtajan avustuksella.'
                className="steps-list-text"
              />
            </ListItem>
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="4. Seuraa tilannetta"
                secondary="Vahvistetut vuorot näkyvät vihreänä, odottavat oranssina. Mikäli vaihdat nimeämisiä sovi siitä toisen vanhemman/huoltajan tai joukkueenjohtajan kanssa."
                className="steps-list-text"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
