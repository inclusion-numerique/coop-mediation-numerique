'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { getServerUrl } from '@/configuration/projet/serveur'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMediateur } from '@/features/authentification/middlewares/with-mediateur'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { PRENDRE_RENDEZ_VOUS_ERRORS } from '@/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.errors'
import { PrendreRendezVousValidation } from '@/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.validation'
import { MediateurProprietaireId } from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { prendreRendezVous } from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/prendre-rendez-vous'
import { beneficiaireADemander } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/beneficiaire-a-demander.query'
import { compteDuMediateur } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/compte-du-mediateur.query'
import { lierUsagerAuBeneficiaire } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/lier-usager-au-beneficiaire.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { UrlRetour } from '@/features/rdvsp/domain/rdv/demande-rdv'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { fromResult, withInput } from '@/libraries/nextjs'

export const prendreRendezVousAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withMediateur())
  .use(withInput(PrendreRendezVousValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) => {
        const resultat = await prendreRendezVous({
          beneficiaireADemander,
          compteDuMediateur,
          creerDemandeRdv: rdvServicePublicApi({
            ...configurationRdvServicePublic(),
            onJetonsRenouveles: enregistrerLesJetons,
            jetonsCourants,
          }).creerDemandeRdv,
          lierUsager: lierUsagerAuBeneficiaire,
          urlDossierBeneficiaire: (id) =>
            UrlRetour(
              getServerUrl(`/coop/mes-beneficiaires/${id}/accompagnements`, {
                absolutePath: true,
              }),
            ),
        })({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurProprietaireId(mediateur.id),
          beneficiaireId: input.beneficiaireId,
        })

        return resultat.success
          ? { success: true as const, data: { url: resultat.data.creee.url } }
          : resultat
      },
      { onError: PRENDRE_RENDEZ_VOUS_ERRORS },
    ),
  )
