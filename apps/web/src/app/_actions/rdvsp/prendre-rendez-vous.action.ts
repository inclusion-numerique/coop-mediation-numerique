'use server'

import { withAuth, withMediateur } from '@app/web/features/authentification'
import { PRENDRE_RENDEZ_VOUS_ERRORS } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.errors'
import { PrendreRendezVousValidation } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/action/prendre-rendez-vous.validation'
import { MediateurProprietaireId } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { prendreRendezVous } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prendre-rendez-vous'
import { beneficiaireADemander } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/beneficiaire-a-demander.query'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/compte-du-mediateur.query'
import { lierUsagerAuBeneficiaire } from '@app/web/features/rdvsp/abilities/prendre-rendez-vous/implementation/prisma/lier-usager-au-beneficiaire.mutation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { rdvServicePublicApiBinding } from '@app/web/features/rdvsp/implementation/rdv-service-public.bindings'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { getServerUrl } from '@app/web/utils/baseUrl'

const demander = prendreRendezVous({
  beneficiaireADemander,
  compteDuMediateur,
  creerDemandeRdv: rdvServicePublicApiBinding.creerDemandeRdv,
  lierUsager: lierUsagerAuBeneficiaire,
  urlDossierBeneficiaire: (id) =>
    getServerUrl(`/coop/mes-beneficiaires/${id}/accompagnements`, {
      absolutePath: true,
    }),
})

export const prendreRendezVousAction = actionBuilder()
  .use(withAuth())
  .use(withMediateur())
  .use(withInput(PrendreRendezVousValidation))
  .execute(
    fromResult(
      async ({ user, mediateur, input }) => {
        const resultat = await demander({
          utilisateurId: UtilisateurCoopId(user.id),
          mediateurId: MediateurProprietaireId(mediateur.id),
          beneficiaireId: input.beneficiaireId,
        })

        // Seule l'URL de prise de rendez-vous intéresse le navigateur, qui n'a
        // qu'à s'y rendre.
        return resultat.success
          ? { success: true as const, data: { url: resultat.data.url } }
          : resultat
      },
      { onError: PRENDRE_RENDEZ_VOUS_ERRORS },
    ),
  )
