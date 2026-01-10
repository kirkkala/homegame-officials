import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { GamesList } from "@/components/games-list"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <GamesList />
        <Footer />
      </Container>
    </Box>
  )
}
