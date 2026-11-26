'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { AJOUTER_DES_LIEUX_ACTIVITE_ERRORS } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.errors'
import { LieuxAAjouterValidation } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/ajouter-des-lieux-activite.validation'
import { depuisLePanier } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/action/panier.transfer'
import { ajouterDesLieuxActivite } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain/ajouter-des-lieux-activite'
import { trouverStructuresCarto } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot/trouver-structures-carto.query'
import { rattacherAuxLieux } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/ajouter-des-lieux-activite.mutation'
import { lireLieuxDejaRattaches } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/lieux-deja-rattaches.query'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

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

        const ajout = await ajouterDesLieuxActivite({
          lireLieuxDejaRattaches,
          trouverStructuresCarto,
          rattacherAuxLieux,
        })({
          demandes: demandes.data,
          utilisateurId: UtilisateurId(user.id),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          maintenant: new Date(),
        })

        return ajout.success
          ? success({ lieux: ajout.data.lieuxRattaches })
          : ajout
      },
      { onError: AJOUTER_DES_LIEUX_ACTIVITE_ERRORS },
    ),
  )
