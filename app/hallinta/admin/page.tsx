"use client"

import { ArrowBack as ArrowBackIcon } from "@mui/icons-material"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import NextLink from "next/link"
import { useSession } from "next-auth/react"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"
import { getUsers } from "@/lib/storage"

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <MainHeader />
    <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
      {children}
    </Container>
    <Footer />
  </Box>
)

export default function AdminPage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"
  const isAdmin = !!user?.isAdmin

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAdmin,
  })

  if (authLoading) {
    return (
      <PageLayout>
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <Stack alignItems="center" py={8} gap={2}>
          <Typography>Tämä sivu on vain järjestelmän pääkäyttäjälle.</Typography>
          <Button component={NextLink} href="/hallinta">
            Siirry joukkueen asetuksiin
          </Button>
        </Stack>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Stack gap={3}>
        <Box>
          <Button
            component={NextLink}
            href="/hallinta"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ color: "text.secondary" }}
          >
            Takaisin joukkueen asetuksiin
          </Button>
          <Typography component="h2" variant="h5" sx={{ mt: 1 }}>
            Admin zone
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack gap={2}>
            <Typography component="h3" variant="h6">
              Rekisteröityneet käyttäjät ({users.length})
            </Typography>
            {usersLoading ? (
              <Stack alignItems="center" py={2}>
                <CircularProgress size={24} />
              </Stack>
            ) : users.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Ei rekisteröityneitä käyttäjiä.
              </Typography>
            ) : (
              <Stack gap={1}>
                {users.map((u) => (
                  <Stack key={u.id} direction="row" flexWrap="wrap" alignItems="center" gap={1}>
                    <Chip label={u.email} />
                    {u.teams.length > 0 ? (
                      u.teams.map((t) => (
                        <Chip key={t.id} label={t.name} size="small" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        ei hallittavia joukkueita
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </PageLayout>
  )
}
