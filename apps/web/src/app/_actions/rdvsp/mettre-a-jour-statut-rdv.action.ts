'use server'

import { withAuth } from '@app/web/features/authentification'
import { METTRE_A_JOUR_STATUT_RDV_ERRORS } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.errors'
import { MettreAJourStatutRdvValidation } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.validation'
import { mettreAJourStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/enregistrer-statut-rdv.mutation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { rdvServicePublicApiBinding } from '@app/web/features/rdvsp/implementation/rdv-service-public.bindings'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

const mettreAJourStatut = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApiBinding.changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})

export const mettreAJourStatutRdvAction = actionBuilder()
  .use(withAuth())
  .use(withInput(MettreAJourStatutRdvValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        mettreAJourStatut({
          utilisateurId: UtilisateurCoopId(user.id),
          rdvId: input.rdvId,
          statut: input.statut,
        }),
      { onError: METTRE_A_JOUR_STATUT_RDV_ERRORS },
    ),
  )
