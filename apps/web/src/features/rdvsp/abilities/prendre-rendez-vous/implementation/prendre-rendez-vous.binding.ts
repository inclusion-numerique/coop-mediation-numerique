import { getServerUrl } from '@app/web/utils/baseUrl'
import { rdvServicePublicApiBinding } from '../../../implementation/rdv-service-public.bindings'
import { prendreRendezVous } from './prendre-rendez-vous'
import { beneficiaireADemander } from './prisma/beneficiaire-a-demander.query'
import { compteDuMediateur } from './prisma/compte-du-mediateur.query'
import { lierUsagerAuBeneficiaire } from './prisma/lier-usager-au-beneficiaire.mutation'

/**
 * Composition de l'ability avec ses adaptateurs réels, et avec l'URL de retour
 * vers le dossier du bénéficiaire — que RDV Service Public affiche à l'agent une
 * fois le rendez-vous pris.
 *
 * À importer par ce chemin explicite : le module tire Prisma et la configuration
 * de l'API, qu'un composant client ne doit jamais embarquer.
 */
export const prendreRendezVousBinding = prendreRendezVous({
  beneficiaireADemander,
  compteDuMediateur,
  creerDemandeRdv: rdvServicePublicApiBinding.creerDemandeRdv,
  lierUsager: lierUsagerAuBeneficiaire,
  urlDossierBeneficiaire: (id) =>
    getServerUrl(`/coop/mes-beneficiaires/${id}/accompagnements`, {
      absolutePath: true,
    }),
})
