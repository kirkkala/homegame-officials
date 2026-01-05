import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { GamesList } from "@/components/games-list"
import { MainHeader } from "@/components/header"

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <GamesList />
      </Container>
    </Box>
  )
}
