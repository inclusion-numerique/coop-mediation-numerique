'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { rechercherDesMediateursAInviter } from '@/features/equipe/abilities/inviter-des-membres'
import { RechercherDesMediateursAInviterValidation } from '@/features/equipe/abilities/inviter-des-membres/action/rechercher-des-mediateurs-a-inviter.validation'
import { CoordinateurId } from '@/features/equipe/domain'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesMediateursAInviterAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesMediateursAInviterValidation))
  .execute(async ({ user, input }) =>
    user.coordinateur == null
      ? { mediateurs: [], total: 0 }
      : rechercherDesMediateursAInviter({
          coordinateurId: CoordinateurId(user.coordinateur.id),
          recherche: input.recherche,
        }),
  )
