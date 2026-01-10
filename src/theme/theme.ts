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
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          minWidth: "auto",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          "@media (min-width: 600px)": {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: 12,
          paddingBottom: 12,
          "&.Mui-selected": {
            backgroundColor: "rgba(255, 66, 56, 0.2)", // primary.light equivalent
            color: "#ff4238",
            "& .MuiListItemIcon-root": {
              color: "#ff4238",
            },
          },
        },
      },
    },
  },
})
