"use client"

import {
  AssignmentAdd as AssignmentAddIcon,
  CheckCircle as CheckCircleIcon,
  HomeOutlined as HomeOutlinedIcon,
  PersonAdd as PersonAddIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

const steps = [
  {
    icon: <PersonAddIcon />,
    title: "1. Valitse joukkue",
    description: `
      Valitse oma joukkueesi. Valinta tallentuu selaimesi välimuistiin ja
      joukkueen nimi säilyy selaimen URL osoitteessa joten voit jakaa linkin
      jolla pääsee suoraan oikean joukkueen peleihin.
    `,
  },
  {
    icon: <UploadFileIcon />,
    title: "2. Jaa toimitsijavuorot",
    description: `
      Valitse pelin eSCO-, kello- ja hyökkäysaikavuoron (24 s) vastuu
      painamalla "Valitse pelaaja...". Valitse pelaaja kenen huoltajille
      toimitsijavuoron vastuu halutaan osoittaa.
    `,
  },
  {
    icon: <AssignmentAddIcon />,
    title: "3. Vahvista vuoro",
    description: `
      Kun toimitsijavuoro odottaa vahvistusta, joko joukkueenjohtaja tai
      kyseisen pelaajan huoltaja vahvistaa vuoron painamalla "Vahvista"
      painiketta ja valitsee hoitaako vanhempi (huoltaja) itse vuoron vai
      pyydetäänkö tehtävän tekijäksi juniori joukkueenjohtajan avustuksella.
      Poolista otetun henkilön nimen voi lisätä myöhemmin jos se ei vielä ole
      tiedossa.
    `,
  },
  {
    icon: <CheckCircleIcon />,
    title: "4. Seuraa tilannetta",
    description: `
      Vahvistetut vuorot näkyvät vihreänä, odottavat oranssina. Mikäli vaihdat
      nimeämisiä sovi siitä toisen vanhemman/huoltajan tai joukkueenjohtajan
      kanssa.
    `,
  },
]

export default function KayttoohjeetPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h4" component="h2">
              Tietoja ja käyttöohjeet
            </Typography>
            <Typography component="h3" variant="h5">
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
            <Typography component="h3" variant="h5">
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
            <Typography>
              Joukkueen vanhemmat käyttävät applikaatiota ilman kirjautumista.
            </Typography>
            <List className="steps-list">
              {steps.map((step) => (
                <ListItem key={step.title} className="steps-list-item">
                  <ListItemIcon className="steps-list-icon" sx={{ mt: 0.75, color: "primary.main" }}>
                    {step.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={step.title}
                    secondary={step.description}
                    className="steps-list-text"
                  />
                </ListItem>
              ))}
            </List>
            <Typography component="h3" variant="h5">
              Ensiapulaukut
            </Typography>
            <Typography>
              Jos joukkueenjohtaja on ottanut ensiapulaukkujen seurannan käyttöön, näet{" "}
              <Link href="/ensiapulaukut">Ensiapulaukut</Link>-sivulla kenellä ensiapulaukut
              parhaillaan ovat. Eli ota laukku haltuun lisäämällä nimesi tänne jos laukku on tullut
              mukaasi pelistä! Näin kaikki tietävät missä laukut ovat ja vähennetään
              WhatsApp-viestien määrää 🩹
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ mt: 2, p: 2 }}>
          <Button component={Link} href="/" startIcon={<HomeOutlinedIcon />} fullWidth>
            Etusivulle
          </Button>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
