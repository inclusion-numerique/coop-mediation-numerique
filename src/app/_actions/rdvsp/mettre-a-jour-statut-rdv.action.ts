'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { METTRE_A_JOUR_STATUT_RDV_ERRORS } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.errors'
import { MettreAJourStatutRdvValidation } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.validation'
import { mettreAJourStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/enregistrer-statut-rdv.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const mettreAJourLeStatutDuRdv = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApi({
    ...configurationRdvServicePublic(),
    onJetonsRenouveles: enregistrerLesJetons,
    jetonsCourants,
  }).changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})

export const mettreAJourStatutRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(MettreAJourStatutRdvValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const miseAJour = await mettreAJourLeStatutDuRdv({
          utilisateurId: UtilisateurCoopId(user.id),
          rdvId: input.rdvId,
          statut: input.statut,
        })

        return miseAJour.success ? success(miseAJour.data.statut) : miseAJour
      },
      { onError: METTRE_A_JOUR_STATUT_RDV_ERRORS },
    ),
  )
