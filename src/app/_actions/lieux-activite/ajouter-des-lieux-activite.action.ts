'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import {
  ajouterDesLieuxActivite,
  depuisLePanier,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite'
import { AJOUTER_DES_LIEUX_ACTIVITE_ERRORS } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.errors'
import { LieuxAAjouterValidation } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.validation'
import {
  lireLieuxDejaRattaches,
  trouverStructuresCarto,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UserId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

/**
 * L'ajout du panier. C'est ici que se fait la jonction entre l'ability et ses
 * besoins d'implémentation : la lecture des lieux déjà rattachés et celle de
 * l'Entrepôt, que le domaine ne connaît que par ses ports.
 */
export const ajouterDesLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(LieuxAAjouterValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const demandes = depuisLePanier(input.lieux)

        if (!demandes.success) return demandes

        return ajouterDesLieuxActivite({
          demandes: demandes.data,
          userId: UserId(user.id),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          ports: { lireLieuxDejaRattaches, trouverStructuresCarto },
        })
      },
      { onError: AJOUTER_DES_LIEUX_ACTIVITE_ERRORS },
    ),
  )
