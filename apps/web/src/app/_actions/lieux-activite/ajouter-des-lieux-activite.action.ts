'use server'

import { withAuth } from '@app/web/features/authentification'
import { ajouterDesLieuxActivite } from '@app/web/features/lieux-activite'
import { AJOUTER_DES_LIEUX_ACTIVITE_ERRORS } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.errors'
import { LieuxAAjouterValidation } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.validation'
import {
  lireLieuxDejaRattaches,
  trouverStructuresCarto,
} from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

/**
 * L'ajout du panier. C'est ici que se fait la jonction entre l'ability et ses
 * besoins d'implémentation : la lecture des lieux déjà rattachés et celle de
 * l'Entrepôt, que le domaine ne connaît que par ses ports.
 */
export const ajouterDesLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(LieuxAAjouterValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        ajouterDesLieuxActivite({
          demandes: input.lieux,
          userId: user.id,
          mediateurId: user.mediateur?.id ?? null,
          ports: { lireLieuxDejaRattaches, trouverStructuresCarto },
        }),
      { onError: AJOUTER_DES_LIEUX_ACTIVITE_ERRORS },
    ),
  )
