import { Box, Container } from "@mui/material"
import { GamesList } from "@/components/games-list"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"

export default function Home() {
  return (
    <Box>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <GamesList />
        <Footer />
      </Container>
    </Box>
  )
}
