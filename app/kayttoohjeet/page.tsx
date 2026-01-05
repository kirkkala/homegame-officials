"use client"

import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import GroupsIcon from "@mui/icons-material/Groups"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SettingsIcon from "@mui/icons-material/Settings"
import { MainHeader } from "@/components/header"
import { Footer } from "@/components/footer"

export default function KaijttoohjeetPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Käyttöohjeet
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mikä tämä on?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Kotipelien toimitsijat -sovellus auttaa hallitsemaan koripallo-otteluiden pöytäkirja- ja
            kellovuoroja. Sovelluksella voit jakaa vuorot pelaajille ja seurata niiden vahvistuksia.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Näin pääset alkuun
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Lataa ottelutiedot"
                secondary="Mene Hallinta-sivulle ja lataa eLSA-excel tiedosto, joka sisältää joukkueen kotipelit."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Lisää pelaajat"
                secondary="Lisää joukkueen pelaajat Hallinta-sivulla. Voit lisätä pelaajia manuaalisesti tai tuoda ne tiedostosta."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Jaa vuorot"
                secondary="Etusivulla näet tulevat kotipelit. Klikkaa peliä ja jaa pöytäkirja- ja kellovuorot pelaajille."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="4. Vahvista vuorot"
                secondary="Kun huoltaja tai juniori vahvistaa vuoron, merkitse se tehdyksi. Näet kerralla kuka hoitaa minkäkin vuoron."
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vinkkejä
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
            <li>Vuoron voi merkitä joko huoltajan tai junioripoolista tulevan henkilön hoidettavaksi</li>
            <li>Huoltajan nimi on pakollinen, juniorin nimi on valinnainen</li>
            <li>Vahvistetut vuorot näkyvät vihreällä taustavärillä</li>
            <li>Voit poistaa vahvistuksen ja vaihtaa vuoron toiselle henkilölle tarvittaessa</li>
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}

