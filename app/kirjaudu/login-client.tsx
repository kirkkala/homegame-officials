"use client"

import { Box, Container, Stack } from "@mui/material"
import { AppProvider } from "@toolpad/core/AppProvider"
import { SignInPage, type AuthProvider, type AuthResponse } from "@toolpad/core/SignInPage"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { MainHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { theme } from "@/theme/theme"

const providers: AuthProvider[] = [{ id: "google", name: "Google" }]

type LoginClientProps = {
  adminEmail: string
}

export function LoginClient({ adminEmail }: LoginClientProps) {
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
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MainHeader />
      <Container maxWidth="sm" sx={{ py: 4, flex: 1 }}>
        <Stack gap={2}>
          <AppProvider theme={theme}>
            <SignInPage
              providers={providers}
              signIn={handleSignIn}
              localeText={{
                signInTitle: "Joukkeenjohtajan kirjautuminen",
                signInSubtitle: `Sovelluksen pääkäyttäjä on ${adminEmail}.`,
              }}
              slotProps={{
                form: { noValidate: true },
              }}
              sx={{
                minHeight: "auto",
              }}
            />
          </AppProvider>
        </Stack>
      </Container>
      <Footer />
    </Box>
  )
}
