"use client"

import { useParams } from "next/navigation"
import { GamePage } from "@/components/game-page"

export default function OtteluPage() {
  const params = useParams<{ id: string }>()
  return <GamePage gameId={params.id} />
}
