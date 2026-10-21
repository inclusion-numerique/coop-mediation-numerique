'use server'

import { withAuth } from '@app/web/features/authentification'
import { rechercherDesMediateursAInviter } from '@app/web/features/equipe/abilities/inviter-des-membres'
import { RechercherDesMediateursAInviterValidation } from '@app/web/features/equipe/abilities/inviter-des-membres/action/rechercher-des-mediateurs-a-inviter.validation'
import { CoordinateurId } from '@app/web/features/equipe/domain'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

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
