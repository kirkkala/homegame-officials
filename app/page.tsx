import { Box, Container } from "@mui/material"
import { GamesList } from "@/components/games-list"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        <GamesList />
      </Container>
      <Footer />
    </Box>
  )
}
