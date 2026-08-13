"use client"

import {
  AssignmentAdd as AssignmentAddIcon,
  CheckCircle as CheckCircleIcon,
  HomeOutlined as HomeOutlinedIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
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
      Valitse joukkue yläpalkin valikosta tai kännykällä hampurilaisvalikon alta.
      Selaimesi muistaa valinnan, ja voit jakaa sivun linkin muille vanhemmille -
      he näkevät linkillä suoraan oikean joukkueen pelit.
    `,
  },
  {
    icon: <UploadFileIcon />,
    title: "2. Jaa toimitsijavuorot",
    description: `
      Paina pelin toimitsijavuoron kohdalla "Valitse pelaaja..." ja osoita eSCO-,
      kello- tai 24 sekunnin vuoro pelaajan huoltajille.
    `,
  },
  {
    icon: <AssignmentAddIcon />,
    title: "3. Vahvista vuoro",
    description: `
      Joukkueenjohtaja tai huoltaja painaa "Vahvista" ja kirjaa, tekeekö
      vuoron vanhempi itse vai juniori poolista (maksua vastaan). Juniorin
      nimen voi tarvittaessa lisätä vuorolle myöhemmin.
    `,
  },
  {
    icon: <CheckCircleIcon />,
    title: "4. Seuraa tilannetta",
    description: `
      Vihreä = vahvistettu, oranssi = odottaa vahvistusta. Jos vaihdat
      nimeämistä, sovi siitä etukäteen. Menneet pelit löytyvät valitsemalla
      "Näytä menneet pelit" listauksessa. Mikäli joukkueenjohtaja on lisännyt
      myös vieraspelit ne saa piilotettua listauksesta.
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
            <Typography sx={{ fontWeight: 500 }}>
              Nettisivu junnukoriksen joukkueen kotipelien toimitsijavuorojen jakoon ja seurantaan.
            </Typography>
            <Typography>
              Joukkueenjohtaja voi yhdessä joukkueen vanhempien kanssa jakaa toimitsijavuoroja
              kauden aikana tämän nettisivun kautta. Kaikki näkevät yhdellä silmäyksellä, että
              jokaiseen peliin löytyy toimitsijat ja että vuorot jakautuvat tasaisesti joukkueen
              jäsenien kesken.
            </Typography>
            <Typography>
              Kirjautuminen tarvitaan vain joukkueenjohtajalta. Vanhemmat vahvistavat omat vuoronsa
              ilman tunnuksia. Vuoron saaneen huoltajan tehtävä on varmistaa, että joku hoitaa sen –
              itse, toinen vanhempi tai juniori poolista (maksua vastaan).
            </Typography>
            <Typography>
              Täällä voi myös seurata myös missä joukkueen ensiapulaukut ovat!
            </Typography>
            <Divider />
            <Typography component="h3" variant="h5">
              Näin pääset alkuun
            </Typography>
            <Typography component="h4" variant="h6">
              Joukkueenjohtajalle
            </Typography>
            <Typography>
              Kirjaudu sisään, luo joukkue, lisää pelaajat ja tuo ottelut{" "}
              <Link href="https://elsa-myclub.hnmky.fi/" target="_blank" rel="noopener">
                eLSA → MyClub Muuntaja
              </Link>
              -excelistä tai kirjoita pelit käsin hallintapaneelissa.
            </Typography>
            <Typography>
              Hallintapaneelista voit laittaa päälle ensiapulaukkujen serannan sekä tarvittaessa 24
              sekunnin kellon (vanhempien sarjoihin). Oletuksena käytössä on vain pöytäkirja (eSCO)
              sekä tulostaulu.
            </Typography>
            <Typography component="h4" variant="h6">
              Vanhemmille
            </Typography>
            <Typography>Kirjautumista ei tarvita – näin etenet:</Typography>
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
            <Divider />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <MedicalServicesIcon color="primary" />
              <Typography component="h3" variant="h5">
                Ensiapulaukut
              </Typography>
            </Stack>
            <Typography>
              Jos joukkueenjohtaja on aktivoinut seurannan, näet{" "}
              <Link href="/ensiapulaukut">Ensiapulaukut</Link>-sivulla kenellä laukut ovat. Kun
              laukku tulee mukaasi pelistä, lisää nimesi seurantaan painamalla "Ota laukku haltuun"
              tai "Vaihda haltija" mikäli laukku on merkitty edelliselle haltijalle. Näin koko
              joukkue näkee tilanteen helposti ilman ylimääräisiä WhatsApp-kyselyitä.
            </Typography>
            <Divider />
            <Typography component="h2" variant="h5">
              Kuka tämmöisen meni tekemään? Ja miksi?
            </Typography>
            <Typography>
              HNMKY Stadi 2014 tyttöjen jojo Timo Kirkkala kyllästyi excel-sekoiluun ja askarteli
              applikaation omaan hupiin syksyllä 2025. Hyvä jaettiin eteenpäin ihan oikeana
              nettipalveluna – toivottavasti nautit käytöstä!
            </Typography>
            <Typography>
              Koodi on avoimena lähdekoodina{" "}
              <Link
                href="https://github.com/kirkkala/homegame-officials"
                target="_blank"
                rel="noopener"
              >
                GitHubissa
              </Link>
              . Palaute on tervetullutta – ota yhteyttä joukkueen jojo-kanavalla WhatsAppissa tai
              sähköpostilla{" "}
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
