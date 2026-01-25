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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Käyttöohjeet ja tietosuojaseloste
          </Typography>
        </Paper>
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
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
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
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
                secondary="Etusivulla valitse joukkue, jonka ottelut haluat nähdä. Valittu joukkue tallentuu selaimen välimuistiin ja joukkueen nimi säilyy selaimen URL osoitteessa. Seuraavan kerran sivustolle palattuasi näet oman joukkueesi tiedot. Vaihda valittu joukkue yläpalkin hampurilaisvalikosta"
                className="steps-list-text"
              />
            </ListItem>
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Jaa toimitsijavuorot"
                secondary="Valitse vastuut kotipelien eSCO- ja kellovuoroihin. Vanhemmat voivat tehdä tämän oma-aloitteisesti tai joukkueenjohtaja hoitaa nimeämisen peleihin mistä vastuun hoitaja puuttuu. Nimetyn pelaajan vanhemmat ovat vastuussa toimitsijavuoron hoitamisesta, tarvittaessa sovi toisen vanhemman kanssa mikäli haluat vaihtaa vuoroa. Mikäli et halua tai voi tehdä vuoroa, pyydä jokukkueenjohtajaa hoitamaan juniori poolista vuoron tekijäksi pientä korvausta vastaan."
                className="steps-list-text"
              />
            </ListItem>
            <ListItem className="steps-list-item">
              <ListItemIcon className="steps-list-icon">
                <AssignmentAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Vahvista vuoro"
                secondary='Kun toimitsijavuoro on tilassa "Odottaa vahvistusta", paina toimitsijavuoron painiketta ja merkitse hoitaako vuoron huoltaja vai juniori poolista. Juniorille poolista maksetaan 20 € korvaus toimitsijavuoron tekemisestä. Pyydä joukkueenjohtajaa hankkimaan juniori toimitsijapoolista hyvissä ajoin mikäli haluat käyttää tätä vaihtoehtoa.'
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
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography component="h3" variant="h6" gutterBottom>
            Tietosuojaseloste
          </Typography>
          <Typography>
            Pelajien nimet pyritään pitämään etu- tai lempiniminä jotta tietoja ei voi yhdistää
            henkilöllisyyteen. Kirjautuneen käyttäjän sähköpostiosoite tallentuu tietokantaan.
            Kirjautuminen on toteutettu Google autentikoinnin avulla, kirjautuminen vaatii
            Google-tilin.
          </Typography>
          <Typography>
            Applikaatioon tallennettuja tietoja ei luovuteta kolmansille osapuolille. Applikaation
            hakukonenäkyvyys on estetty robots.txt tiedoston avulla.
          </Typography>
          <Typography>
            Palvelimet sijaitsevat EU-alueella AWS Tukholman datakeskuksessa. Sivusto pyörii{" "}
            <Link href="https://vercel.com/" target="_blank" rel="noopener">
              Vercelin
            </Link>{" "}
            hostingissa.
          </Typography>
          <Typography>
            Lisätietoja applikaation kehittäjältä saa sähköpostitse{" "}
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
