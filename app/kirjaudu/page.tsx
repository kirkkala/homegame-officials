"use client"

import { Box, Container, Stack } from "@mui/material"
import { AppProvider } from "@toolpad/core/AppProvider"
import { SignInPage, type AuthProvider } from "@toolpad/core/SignInPage"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { theme } from "@/theme/theme"

const providers: AuthProvider[] = [
  { id: "google", name: "Google" },
]

export default function LoginPage() {
  const handleSignIn = (provider: AuthProvider) => {
    if (provider.id === "google") {
      window.location.href = "/api/auth/google"
      return
    }
    return Promise.resolve({ error: "Kirjautumistapaa ei tueta vielä." })
  }

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Header title="Kirjautuminen" subtitle="Hallintakäyttöliittymä" backHref="/" />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack gap={2}>
          <AppProvider theme={theme}>
            <SignInPage
              providers={providers}
              signIn={handleSignIn}
              slotProps={{
                form: { noValidate: true },
              }}
              sx={{
                minHeight: "auto",
                py: 2,
                "& form > .MuiStack-root": {
                  marginTop: 0,
                  rowGap: 1,
                },
              }}
            />
          </AppProvider>
        </Stack>
      </Container>
      <Footer />
    </Box>
  )
}
