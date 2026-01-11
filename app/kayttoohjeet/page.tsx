"use client"

import {
  Box,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Groups as GroupsIcon,
  Settings as SettingsIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import { MainHeader } from "@/components/header"
import { Footer } from "@/components/footer"

export default function KaijttoohjeetPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
        >
          Käyttöohjeet
        </Typography>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Mikä tämä on?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Kotipelien toimitsijat -sovellus auttaa hallitsemaan koripallo-otteluiden pöytäkirja- ja
            kellovuoroja. Sovelluksella voit jakaa vuorot pelaajille ja seurata niiden vahvistuksia.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Näin pääset alkuun
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ px: { xs: 0, sm: 2 }, alignItems: "flex-start" }}>
              <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 }, mt: 0.5 }}>
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Lataa ottelutiedot"
                secondary="Mene Hallinta-sivulle ja lataa eLSA-excel tiedosto, joka sisältää joukkueen kotipelit."
              />
            </ListItem>
            <ListItem sx={{ px: { xs: 0, sm: 2 }, alignItems: "flex-start" }}>
              <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 }, mt: 0.5 }}>
                <GroupsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Lisää pelaajat"
                secondary="Lisää joukkueen pelaajat Hallinta-sivulla. Voit lisätä pelaajia manuaalisesti tai tuoda ne tiedostosta."
              />
            </ListItem>
            <ListItem sx={{ px: { xs: 0, sm: 2 }, alignItems: "flex-start" }}>
              <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 }, mt: 0.5 }}>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Jaa vuorot"
                secondary="Etusivulla näet tulevat kotipelit. Klikkaa peliä ja jaa pöytäkirja- ja kellovuorot pelaajille."
              />
            </ListItem>
            <ListItem sx={{ px: { xs: 0, sm: 2 }, alignItems: "flex-start" }}>
              <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 }, mt: 0.5 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="4. Vahvista vuorot"
                secondary="Kun huoltaja tai juniori vahvistaa vuoron, merkitse se tehdyksi. Näet kerralla kuka hoitaa minkäkin vuoron."
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Vinkkejä
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="ul"
            sx={{ pl: { xs: 2, sm: 3 }, m: 0 }}
          >
            <li>
              Vuoron voi merkitä joko huoltajan tai junioripoolista tulevan henkilön hoidettavaksi
            </li>
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
