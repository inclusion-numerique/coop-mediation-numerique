'use client'

import type { ServerActionResult } from '@/libraries/nextjs'
import { createToast } from '@/libraries/ui/toast'
import type { ModifierLaFicheDuLieuSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'

export type EnregistrerUneSection = (
  saisie: ModifierLaFicheDuLieuSaisie,
) => Promise<ServerActionResult<unknown>>

export const useEnregistrementDeSection =
  (id: string, enregistrer: EnregistrerUneSection) =>
  async (modification: ModifierLaFicheDuLieuSaisie['modification']) => {
    const resultat = await enregistrer({ id, modification })

    createToast(
      resultat.success
        ? {
            priority: 'success',
            message: 'Le lieu d’activité a bien été modifié.',
          }
        : { priority: 'error', message: resultat.error },
    )
  }
