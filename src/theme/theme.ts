"use client"

import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
  palette: {
    primary: { main: "#ff4238" }, // HNMKY red
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" },
      },
    },
  },
})
