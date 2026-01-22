"use client"

import { Box, Container, Stack } from "@mui/material"
import { AppProvider } from "@toolpad/core/AppProvider"
import { SignInPage, type AuthProvider, type AuthResponse } from "@toolpad/core/SignInPage"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { theme } from "@/theme/theme"

const providers: AuthProvider[] = [{ id: "google", name: "Google" }]

export default function LoginPage() {
  const handleSignIn = async (
    provider: AuthProvider,
    _formData?: unknown,
    callbackUrl?: string
  ): Promise<AuthResponse> => {
    if (provider.id !== "google") {
      return { error: "Kirjautumistapaa ei tueta vielä." }
    }
    await nextAuthSignIn("google", { callbackUrl: callbackUrl ?? "/hallinta" })
    return {}
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
