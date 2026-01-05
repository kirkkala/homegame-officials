import FavoriteIcon from "@mui/icons-material/Favorite"
import Box from "@mui/material/Box"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        pt: 3,
        borderTop: 1,
        borderColor: "divider",
        textAlign: "center",
        color: "text.secondary",
      }}
    >
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
    </Box>
  )
}
