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
      Valitse pelin eSCO-, kello- ja tarvittaessa hyökkäysajan (24 sekuntia) vastuu
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
      palkataanko tehtävän tekijäksi juniori joukkueenjohtajan avustuksella
      (maksua vastaan). Poolista otetun tekijän nimen voi lisätä myöhemmin
      mikäli se ei valintahetkellä ole tiedossa.
    `,
  },
  {
    icon: <CheckCircleIcon />,
    title: "4. Seuraa tilannetta",
    description: `
      Vahvistetut vuorot näkyvät vihreänä, odottavat oranssina. Mikäli vaihdat
      nimeämisiä sovi siitä toisen vanhemman/huoltajan tai joukkueenjohtajan
      kanssa. Menneet pelit ovat automaattisesti piilotettuina mutta niitä voi
      tarkastella valitsemalla "Menneet pelit" -valinnan etusivulla.
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
              Sovellus on vaihtoehto excel-jumpalle kotipelien toimitsijavuorojen jakamiseen.
            </Typography>
            <Typography>
              Sekä joukkueenjohtaja että vanhemmat voivat vahvistaa toimitsijavuoroja kauden aikana.
              Sovelluksesta näkee helposti, että vuorot on hoidettu kaikkiin peleihin ja jaettu
              tasaisesti.
            </Typography>
            <Typography>
              Vain joukkueenjohtajan tarvitsee kirjautua joukkueensa pelien hallintaa varten.
              Vanhemmat vahvistavat heille osoitetun toimitsijavuoron tekemisen ilman kirjautumista.
              Mikäli toimitsijavuoro on osoitettu vanhemmalle, on hänen vastuulla varmistaa että
              siihen on tekijä; joko itse, pyytämällä toista joukkueen vanhempaa tai valitsemalla
              juniorin poolista (maksua vastaan) tekemään kyseisen vuoron.
            </Typography>
            <Typography>
              Sovelluksessa on myös helppo seuranta joukkueen ensiapulaukuista jotta peliä
              edeltävinä päivinä voi varmistaa että laukut kulkeutuvat mukaan otteluihin.
            </Typography>
            <Typography component="h3" variant="h5">
              Näin pääset alkuun
            </Typography>
            <Typography>
              Joukkueenjohtaja kirjautuu sisään ja luo joukkueen{" "}
              <Link href="https://elsa-myclub.hnmky.fi/" target="_blank" rel="noopener">
                eLSA → MyClub Muuntaja
              </Link>{" "}
              appilla tehdystä excel-tiedostosta sekä lisää pelaajat ja merkitsee kotiottelut
              hallintapaneelin kautta. Hallintapaneelista voi aktivoida ensiapulaukujen seurannan
              sekä tarvittaessa 24 sekunnin heittokellon toimitsijavuoron (vain U13 ja vanhemmat).
              Oletuksena sovelluksessa on vain pöytäkirja (eSCO) sekä kello (tulostaulu)
              toimitsijavastuina.
            </Typography>
            <Typography>
              Joukkueen vanhemmat käyttävät applikaatiota ilman kirjautumista:
            </Typography>
            <List className="steps-list">
              {steps.map((step) => (
                <ListItem key={step.title} className="steps-list-item">
                  <ListItemIcon
                    className="steps-list-icon"
                    sx={{ mt: 0.75, color: "primary.main" }}
                  >
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
              mukaasi pelistä! Näin koko joukkueella on mahdollisuus nähdä yhdestä paikkaa kenellä
              laukut kulloinkin ovat ja vähennämme ryhmän WhatsApp-viestien määrää.
            </Typography>
            <Typography component="h3" variant="h5">
              Kuka tämän on tehnyt?
            </Typography>
            <Typography>
              HNKY Stadi 2014 tyttöjen jojo Timo Kirkkala on askarrellut applikaatiota
              harrasteprojektina syksystä 2025 että toimitsijavuorojen kanssa säätäminen veisi
              vähemmän aikaa excelin parissa.
            </Typography>
            <Typography>
              Koodi on julkaistu avoimena lähdekoodina{" "}
              <Link
                href="https://github.com/kirkkala/homegame-officials"
                target="_blank"
                rel="noopener"
              >
                GitHubissa
              </Link>
              .
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
