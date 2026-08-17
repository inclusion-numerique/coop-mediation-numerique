import { success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import type {
  UserId,
  UserMediateur,
  UserWithExistingRdvAccount,
} from '@app/web/utils/user'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from '../abilities/synchroniser-compte-rdv/implementation/prisma/journal-synchronisation.prisma'
import { synchroniserCompteRdv } from '../abilities/synchroniser-compte-rdv/implementation/synchroniser-compte-rdv'
import { appliquerPlanOrganisations } from '../abilities/synchroniser-organisations/implementation/prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from '../abilities/synchroniser-organisations/implementation/prisma/etat-organisations.query'
import { synchroniserOrganisations } from '../abilities/synchroniser-organisations/implementation/synchroniser-organisations'
import { rapprocherBeneficiaires } from '../abilities/synchroniser-rdvs/implementation/beneficiaire/rapprocher-beneficiaires.adapter'
import {
  appliquerPlanLot,
  supprimerRdvs,
} from '../abilities/synchroniser-rdvs/implementation/prisma/appliquer-plan-lot.mutation'
import {
  etatConnuDuLot,
  rdvsDejaImportes,
} from '../abilities/synchroniser-rdvs/implementation/prisma/etat-connu.query'
import { synchroniserRdvs } from '../abilities/synchroniser-rdvs/implementation/synchroniser-rdvs'
import { compteRdvToDomain } from '../db'
import { bilanVide } from '../domain/bilan-synchronisation'
import { estUtilisable } from '../domain/compte-rdv'
import { OrganisationId } from '../domain/organisation-id'
import { rdvServicePublicApiBinding } from '../implementation/rdv-service-public.bindings'
import { installWebhooks } from './installWebhooks'

export type AppendLog = (log: string | string[]) => void

const bilanRdvsVide = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
}

/**
 * Adaptateur de transition entre l'orchestrateur historique et les abilities.
 *
 * Il ne fait plus que résoudre le compte et câbler les trois réconciliations.
 * L'installation des webhooks reste sur son chemin d'origine : elle relève de
 * l'installation d'infrastructure, pas d'un cas d'usage métier, et n'a donc pas
 * de port.
 */
export const syncAllRdvData = async ({
  user,
  organisationIds,
}: {
  user: UserWithExistingRdvAccount & UserId & UserMediateur
  organisationIds?: number[]
}) => {
  const row = await prismaClient.rdvAccount.findUniqueOrThrow({
    where: { id: user.rdvAccount.id },
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

  const mediateurId = user.mediateur?.id

  const synchroniser = synchroniserCompteRdv({
    reconcilierOrganisations: synchroniserOrganisations({
      listerOrganisations: rdvServicePublicApiBinding.listerOrganisations,
      etatOrganisations,
      appliquerPlan: appliquerPlanOrganisations,
    }),
    // Sans médiateur, aucun rendez-vous n'est rattachable : le compte existe,
    // mais il n'a personne à qui appartenir.
    reconcilierRdvs: async ({
      compte: aSynchroniser,
      organisationIds: portee,
    }) =>
      mediateurId === undefined
        ? success(bilanRdvsVide)
        : synchroniserRdvs({
            listerRdvs: rdvServicePublicApiBinding.listerRdvs,
            rdvsDejaImportes,
            etatConnuDuLot,
            appliquerPlan: appliquerPlanLot,
            supprimerRdvs,
            rapprocherBeneficiaires: rapprocherBeneficiaires({
              mediateurId,
              journaliser: tracer,
            }),
          })({ compte: aSynchroniser, organisationIds: portee }),
    reconcilierWebhooks: async ({ organisationIds: portee }) => {
      const resultat = await installWebhooks({
        rdvAccount: {
          id: row.id,
          accessToken: row.accessToken,
          refreshToken: row.refreshToken,
          expiresAt: row.expiresAt,
          scope: row.scope,
          organisations: row.organisations,
        },
        appendLog: (log) => journal.push(...[log].flat()),
        organisationIds: portee === undefined ? undefined : [...portee],
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
    throw new Error(
      `Impossible de synchroniser le compte RDV (${resultat.error._tag})`,
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
