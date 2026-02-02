import { Footer } from "@/components/footer"
import { GamesList } from "@/components/games-list"
import { MainHeader } from "@/components/header"
import { Box, Container } from "@mui/material"

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
