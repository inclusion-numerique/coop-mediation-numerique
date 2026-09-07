'use client'

import { createToast } from '@app/ui/toast/createToast'
import type { ModifierLaFicheDuLieuSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'

/**
 * L'enregistrement d'une section, identique pour les sept : on envoie, on dit
 * ce qui s'est passé. La carte se referme et rafraîchit d'elle-même quand le
 * formulaire est valide.
 */
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
