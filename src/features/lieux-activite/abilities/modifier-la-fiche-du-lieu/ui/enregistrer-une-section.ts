import type { ServerActionResult } from '@/libraries/nextjs'
import type { ModifierLaFicheDuLieuSaisie } from '../action/modifier-la-fiche-du-lieu.validation'

export type EnregistrerUneSection = (
  saisie: ModifierLaFicheDuLieuSaisie,
) => Promise<ServerActionResult<unknown>>
