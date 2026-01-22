import { Box, Container, Link as MuiLink, Typography } from "@mui/material"
import { Favorite as FavoriteIcon } from "@mui/icons-material"

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "common.white",
        width: "100%",
      }}
    >
      <Container maxWidth="md" sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
        <Typography sx={{ mb: 0.5 }}>
          Made with{" "}
          <FavoriteIcon
            sx={{
              fontSize: "1rem",
              transform: "translateY(2px)",
              color: "primary.main",
            }}
          />{" "}
          by{" "}
          <MuiLink href="https://github.com/kirkkala" target="_blank" rel="noopener noreferrer">
            Timo Kirkkala
          </MuiLink>
        </Typography>
        <Typography>
          Source code published on{" "}
          <MuiLink
            href="https://github.com/kirkkala/homegame-officials"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  )
}
