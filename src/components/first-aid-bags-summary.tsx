"use client"

import {
  EditOutlined as EditIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material"
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material"
import NextLink from "next/link"
import { useCallback, useEffect, useState } from "react"
import { type FirstAidBagsData, getBagCountForTeam, getFirstAidBags } from "@/lib/first-aid-bags"
import { formatDate } from "@/lib/utils"
import { useTeam } from "./team-context"

export function FirstAidBagsSummary() {
  const { selectedTeam } = useTeam()
  const [bags, setBags] = useState<FirstAidBagsData>({})

  const refresh = useCallback(() => {
    if (selectedTeam) setBags(getFirstAidBags(selectedTeam.id))
  }, [selectedTeam])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [refresh])

  if (!selectedTeam) return null

  const bagCount = getBagCountForTeam(selectedTeam.id)
  const hasAnyHolder = Object.values(bags).some(Boolean)

  return (
    <Card variant="outlined">
      <CardActionArea component={NextLink} href="/ensiapulaukut">
        <CardContent>
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
                {Array.from({ length: bagCount }, (_, i) => i + 1).map((n) => {
                  const h = bags[`bag${n}`]
                  const label = h
                    ? `#${n}: ${h.name} (${formatDate(h.lastSeenAt, { format: "short" })})`
                    : `#${n}: ???`
                  return <li key={n}>{label}</li>
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
