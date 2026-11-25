import { bilanVide } from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import { estUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import { EchecDeSynchronisation } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { diagnosticErreur } from '@/features/rdvsp/domain/errors'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { success } from '@/libraries/result'
import {
  type ReconcilierLesRdvsDuMediateur,
  type ReconcilierOrganisations,
  synchroniserCompteRdv,
} from '../domain/synchroniser-compte-rdv'
import { compteASynchroniser } from './prisma/compte-a-synchroniser.query'
import { detacherOrganisations } from './prisma/detacher-organisations.mutation'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './prisma/journal-synchronisation.mutation'
import { noterLaSynchronisationReussie } from './prisma/synchronisation-reussie.mutation'
import { noterLesWebhooksInvalides } from './prisma/webhooks-invalides.mutation'
import { installWebhooks } from './webhook/installer-webhooks.mutation'

const bilanRdvsVide = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  organisationIdsInaccessibles: [],
}

export const synchroniserCompteAvec =
  (
    reconcilierOrganisations: ReconcilierOrganisations,
    reconcilierLesRdvsDuMediateur: ReconcilierLesRdvsDuMediateur,
  ) =>
  async ({
    compteId,
    mediateurId,
    organisationIds,
  }: {
    compteId: number
    mediateurId?: string
    organisationIds?: number[]
  }): Promise<{ drift: number }> => {
    const compte = await compteASynchroniser(compteId)

    if (!estUtilisable(compte)) {
      return { drift: 0 }
    }

    const journal: string[] = []
    const tracer = (message: string) => {
      journal.push(message)
    }

    const synchroniser = synchroniserCompteRdv({
      reconcilierOrganisations,
      reconcilierRdvs: async (portee) =>
        mediateurId === undefined
          ? success(bilanRdvsVide)
          : reconcilierLesRdvsDuMediateur({
              mediateurId,
              journaliser: tracer,
            })(portee),
      reconcilierWebhooks: async ({
        compte: aInstaller,
        organisationIds: portee,
      }) => {
        const resultat = await installWebhooks({
          compte: aInstaller,
          appendLog: (log) => journal.push(...[log].flat()),
          ...(portee === undefined ? {} : { organisationIds: [...portee] }),
          api: rdvServicePublicApi({
            ...configurationRdvServicePublic(),
            onJetonsRenouveles: enregistrerLesJetons,
            jetonsCourants,
          }),
          noterLesWebhooksInvalides,
        })

        return {
          bilan: resultat,
          organisationIdsSansWebhook:
            resultat.invalidWebhookOrganisationIds === null
              ? undefined
              : resultat.invalidWebhookOrganisationIds.map((id) =>
                  OrganisationId(id),
                ),
        }
      },
      detacherOrganisations,
      ouvrirJournal,
      cloturerJournal,
      echouerJournal,
      journaliser: tracer,
    })

    const resultat = await synchroniser({
      compte,
      ...(organisationIds === undefined
        ? {}
        : { organisationIds: organisationIds.map((id) => OrganisationId(id)) }),
    })

    if (!resultat.success) {
      throw new EchecDeSynchronisation(
        resultat.error._tag,
        diagnosticErreur(resultat.error),
      )
    }

    const { organisationIdsSansWebhook } = resultat.data

    await noterLaSynchronisationReussie({
      agentId: compte.agentId,
      organisationIdsSansWebhook,
    })

    return { drift: resultat.data.derive }
  }
