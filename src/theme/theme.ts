"use client"

import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
  typography: {
    h2: {
      fontSize: "2.25rem",
      lineHeight: 1.15,
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.9rem",
      lineHeight: 1.2,
      fontWeight: 700,
    },
    h4: {
      fontSize: "1.75rem",
      lineHeight: 1.2,
      fontWeight: 700,
    },
    h5: {
      fontSize: "1.25rem",
      lineHeight: 1.3,
      fontWeight: 600,
    },
    h6: {
      fontSize: "1.1rem",
      lineHeight: 1.35,
      fontWeight: 600,
    },
  },
  palette: {
    primary: { main: "#ff4238" }, // HNMKY red
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          marginTop: 8,
          marginBottom: 8,
        },
      },
    },
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
    MuiListItemText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          marginBottom: 0,
          "& .MuiTypography-root": {
            marginTop: 0,
            marginBottom: 0,
          },
        },
      },
    },
  },
})
