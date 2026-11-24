import { prismaClient } from '@/configuration/prisma/prismaClient'
import { bilanVide } from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import { estUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import { EchecDeSynchronisation } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { diagnosticErreur } from '@/features/rdvsp/domain/errors'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { rdvServicePublicApiBinding } from '@/features/rdvsp/implementations/api/rdv-service-public.binding'
import { compteRdvToDomain } from '@/features/rdvsp/implementations/prisma/compte-rdv.transfer'
import { success } from '@/libraries/result'
import {
  type ReconcilierLesRdvsDuMediateur,
  type ReconcilierOrganisations,
  synchroniserCompteRdv,
} from '../domain/synchroniser-compte-rdv'
import { detacherOrganisations } from './prisma/detacher-organisations.mutation'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './prisma/journal-synchronisation.mutation'
import { noterLesWebhooksInvalides } from './prisma/webhooks-invalides.mutation'
import { installWebhooks } from './webhook/installer-webhooks'

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
    const row = await prismaClient.rdvAccount.findUniqueOrThrow({
      where: { id: compteId },
      include: { organisations: { select: { organisationId: true } } },
    })

    const compte = compteRdvToDomain(row)

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
          organisationIds: portee === undefined ? undefined : [...portee],
          api: rdvServicePublicApiBinding,
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
      organisationIds: organisationIds?.map((id) => OrganisationId(id)),
    })

    if (!resultat.success) {
      throw new EchecDeSynchronisation(
        resultat.error._tag,
        diagnosticErreur(resultat.error),
      )
    }

    const { organisationIdsSansWebhook } = resultat.data

    await prismaClient.rdvAccount.update({
      where: { id: compte.agentId },
      data: {
        lastSynced: new Date(),
        error: null,
        ...(organisationIdsSansWebhook === undefined
          ? {}
          : { invalidWebhookOrganisationIds: [...organisationIdsSansWebhook] }),
      },
    })

    return { drift: resultat.data.derive }
  }
