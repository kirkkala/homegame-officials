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
  Groups as GroupsIcon,
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
          <Typography variant="body1" color="text.secondary" paragraph>
            Timo askarteli applikaation AI:n kanssa että kotipelien toimitsijavuorojen jakaminen
            veisi vähemmän aikaa excelin parissa. Koodi on julkaistu avoimena lähdekoodina{" "}
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
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Näin pääset alkuun
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tässä vaiheessa kaikki toiminnot on saatavilla kirjautumatta. Joukkueenjohtajan
            kirjautuminen lisätään myöhemmin.
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <GroupsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Luo joukkue (tulee kirjautumisen taakse)"
                secondary="Luo itsellesi joukkue Hallinta-sivulla."
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <PersonAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Lisää pelaajat (tulee kirjautumisen taakse)"
                secondary="Lisää joukkueen pelaajat Hallinta-sivulla. Voit lisätä pelaajia manuaalisesti tai tuoda ne tiedostosta."
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <UploadFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Lisää ottelut (tulee kirjautumisen taakse)"
                secondary={
                  <>
                    Siirry Hallinta-sivulle ja lisää{" "}
                    <Link href="https://elsa-myclub.vercel.app" target="_blank" rel="noopener">
                      eLSA-excel
                    </Link>{" "}
                    muuntajalla tekemäsi excel-tiedosto, jossa on joukkuseesi ottelut. Pelejä voi
                    lisätä myös käsin yksitellen. Merkitse kotipelit rastilla jotta niihin voi
                    lisätä toimitsijat. Järjestelmä tallentaa valinnat automaattisesti.
                  </>
                }
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <AssignmentAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="4. Jaa vuorot (jojo tai kuka vain)"
                secondary="Etusivulla näet tulevat kotipelit. Klikkaa ottelua ja jaa pöytäkirja- ja kellovuorot pelaajille. Myös pelaajat/huoltajat voivat valita itselleen vuoroja etukäteen."
              />
            </ListItem>
            <ListItem sx={{ alignItems: "flex-start" }}>
              <ListItemIcon sx={{ mt: 0.5 }}>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="5. Vahvista vuorot (kuka vain)"
                secondary='Vahvista vuoro painalammalla "Odottaa vahvistusta" toimitsijavuoroon.'
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
