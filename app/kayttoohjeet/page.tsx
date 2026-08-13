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
  Divider,
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
      Valitse oma joukkueesi ylätunnisteen pudotusvalikosta. Valinta tallentuu
      selaimesi välimuistiin ja joukkueen nimi säilyy selaimen URL osoitteessa
      joten voit jakaa linkin muille joukkueen vanhemmille jotta he pääsevät
      näkemään suoraan oman joukkueen pelit ja toimitsijavuorot.
    `,
  },
  {
    icon: <UploadFileIcon />,
    title: "2. Jaa toimitsijavuorot",
    description: `
      Valitse pelin eSCO-, kello- ja tarvittaessa hyökkäysajan (24 sekuntia)
      vastuu painamalla "Valitse pelaaja...". Valitse pelaaja kenen huoltajille
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
              Sovellus on vaihtoehto excel-jumpalle junnukoriksen kotipelien toimitsijavuorojen
              jakamiseen ja seurantaan.
            </Typography>
            <Typography>
              Sekä joukkueenjohtaja että vanhemmat voivat poimia ja vahvistaa toimitsijavuoroja
              kauden aikana. Sovelluksesta voi kaikki seurata, että kaikkiin sarjapeleihin on
              hoidettu tarvittava määrä toimitsijoita sekä että vuorojen hoitaminen jakaantuu
              tasaisesti joukkueen jäsenien kesken.
            </Typography>
            <Typography>
              Vain joukkueenjohtajan tarvitsee kirjautua joukkueensa pelien hallintaa varten.
              Vanhemmat vahvistavat heille osoitetun toimitsijavuoron ilman kirjautumista. Mikäli
              toimitsijavuoro on osoitettu vanhemmalle, on hänen vastuullaan varmistaa että siihen
              on tekijä; joko itse, pyytämällä toista joukkueen vanhempaa tai valitsemalla juniorin
              poolista (maksua vastaan) tekemään kyseisen vuoron.
            </Typography>
            <Typography>
              Sovelluksessa on lisäksi helppo seuranta joukkueen ensiapulaukuista jotta peliä
              edeltävinä päivinä voidaan varmistaa että laukut kulkeutuvat mukaan otteluihin.
            </Typography>
            <Typography component="h3" variant="h5">
              Näin pääset alkuun
            </Typography>
            <Typography>
              Joukkueenjohtaja kirjautuu sisään, luo joukkueen sekä lisää pelaajat ja tuo ottelut{" "}
              <Link href="https://elsa-myclub.hnmky.fi/" target="_blank" rel="noopener">
                eLSA → MyClub Muuntaja
              </Link>{" "}
              appilla tehdystä excel-tiedostosta tai käsin kirjoittamalla otteluiden tiedot
              hallintapaneelin kautta.
            </Typography>
            <Typography>
              Hallintapaneelista voi aktivoida ensiapulaukujen seurannan sekä tarvittaessa 24
              sekunnin heittokellon toimitsijavuoron (vanhempien ikäluokkien sarjoihin). Oletuksena
              sovelluksessa on pelkästään pöytäkirja (eSCO) sekä kello (tulostaulu)
              toimitsijavastuut.
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
              Mikäli joukkueenjohtaja on aktivoinut ensiapulaukkujen seurannan käyttöön, näet{" "}
              <Link href="/ensiapulaukut">Ensiapulaukut</Link>-sivulla kenellä ensiapulaukut
              parhaillaan ovat. Ota laukku haltuun lisäämällä nimesi seurantaan jos laukku on tullut
              mukaasi pelistä! Näin koko joukkueella on mahdollisuus nähdä yhdestä paikkaa kenellä
              laukut kulloinkin ovat ja vähennämme joukkueiden WhatsApp ryhmien viestien määrää.
            </Typography>
            <Divider />
            <Typography component="h2" variant="h5">
              Kuka tämmöisen meni tekemään? Ja miksi?
            </Typography>
            <Typography>
              HNMKY Stadi 2014 tyttöjen jojo Timo Kirkkala kyllästyi excelien kanssa sekoiluun ja
              askarteli applikaation omaan hupiin syksyllä 2025. Ja miksipä ei hyvää jakaisi
              eteenpäin niin tein tästä ihan oikean nettipalvelun. Toivottavasti nautit käytöstä!
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
            <Typography>
              Kaikenlainen palaute on erittäin tervetullutta! Ota tekikään yhteyttä namikan Jojo-
              kanavalla Whatsappissa taikka sähköpostilla{" "}
              <Link href="mailto:timo.kirkkala@gmail.com">timo.kirkkala@gmail.com</Link>.
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
