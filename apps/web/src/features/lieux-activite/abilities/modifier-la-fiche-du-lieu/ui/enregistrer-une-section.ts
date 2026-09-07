import type { ServerActionResult } from '@app/web/libraries/nextjs'
import type { ModifierLaFicheDuLieuSaisie } from '../action/modifier-la-fiche-du-lieu.validation'

/**
 * Ce que la route branche sur la server action. Les composants ne l'importent
 * pas eux-mêmes : la page la reçoit et la distribue, comme pour les autres
 * features migrées.
 */
export type EnregistrerUneSection = (
  saisie: ModifierLaFicheDuLieuSaisie,
) => Promise<ServerActionResult<unknown>>
