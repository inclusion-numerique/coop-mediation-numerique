import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import type {
  ReconcilierLesRdvsDuMediateur,
  ReconcilierOrganisations,
} from '../domain/synchroniser-compte-rdv'
import { synchroniserLeCompte } from '../domain/synchroniser-le-compte'
import { compteASynchroniser } from './prisma/compte-a-synchroniser.query'
import { detacherOrganisations } from './prisma/detacher-organisations.mutation'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './prisma/journal-synchronisation.mutation'
import { noterLaSynchronisationReussie } from './prisma/synchronisation-reussie.mutation'
import { reconcilierWebhooks } from './webhook/reconcilier-webhooks.adapter'

export const synchroniserCompteAvec = (
  reconcilierOrganisations: ReconcilierOrganisations,
  reconcilierLesRdvsDuMediateur: ReconcilierLesRdvsDuMediateur,
) =>
  synchroniserLeCompte({
    lireLeCompte: compteASynchroniser,
    reconcilierOrganisations,
    reconcilierLesRdvsDuMediateur,
    reconcilierWebhooks: reconcilierWebhooks(
      rdvServicePublicApi({
        ...configurationRdvServicePublic(),
        onJetonsRenouveles: enregistrerLesJetons,
        jetonsCourants,
      }),
    ),
    detacherOrganisations,
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
    noterLaSynchronisationReussie,
  })
