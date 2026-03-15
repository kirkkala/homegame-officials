"use client"

import {
  EditOutlined as EditIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material"
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material"
import NextLink from "next/link"
import { useFirstAidBags } from "@/hooks/use-first-aid-bags"
import { getBagCountForTeam } from "@/lib/first-aid-bags"
import { formatDate } from "@/lib/utils"
import { useTeam } from "./team-context"

export function FirstAidBagsSummary() {
  const { selectedTeam } = useTeam()
  const { bags } = useFirstAidBags(selectedTeam?.id ?? null, selectedTeam ?? undefined)

  if (!selectedTeam) return null

  const bagCount = getBagCountForTeam(selectedTeam)
  const hasAnyHolder = Object.values(bags).some(Boolean)

  return (
    <Card variant="elevation" sx={{ boxShadow: "none" }}>
      <CardActionArea component={NextLink} href="/ensiapulaukut">
        <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <MedicalServicesIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2">Ensiapulaukut</Typography>
              </Stack>
              <EditIcon
                color="action"
                fontSize="small"
                aria-label="Muokkaa ensiapulaukkujen haltijoita"
              />
            </Stack>
            {hasAnyHolder ? (
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 0.5,
                  listStyle: "none",
                  typography: "body2",
                  color: "text.secondary",
                }}
              >
                {Array.from({ length: bagCount }, (_, i) => i + 1).map((bagNumber) => {
                  const holder = bags[`bag${bagNumber}`]
                  const label = holder
                    ? `#${bagNumber}: ${holder.name} (${formatDate(holder.lastSeenAt, { format: "short" })})`
                    : `#${bagNumber}: ???`
                  return <li key={bagNumber}>{label}</li>
                })}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 3 }}>
                Ei merkattuja haltijoita
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
