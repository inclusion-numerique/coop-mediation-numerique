import { compteRdvToDomain } from '@app/web/features/rdvsp/db'
import { estUtilisable } from '@app/web/features/rdvsp/domain/compte-rdv'
import { OrganisationId } from '@app/web/features/rdvsp/domain/organisation-id'
import { prismaClient } from '@app/web/prismaClient'
import type { OAuthRdvApiCredentialsWithId } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
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
import { rdvServicePublicApiBinding } from '../implementation/rdv-service-public.bindings'
import type { AppendLog } from './syncAllRdvData'
import type { SyncModelResult } from './syncLog'

const bilanVide = { noop: 0, created: 0, updated: 0, deleted: 0, count: 0 }

const resultatVide = {
  rdvs: bilanVide,
  users: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
}

/**
 * Adaptateur de transition : l'orchestrateur de synchronisation travaille encore
 * avec les identifiants OAuth bruts, l'ability avec un `CompteRdv`. Ce module
 * fait le pont et disparaîtra quand `syncAllRdvData` migrera à son tour.
 *
 * Toute la réconciliation vit désormais dans l'ability : plus aucun payload de
 * RDV Service Public ne traverse ce fichier.
 */
export const importRdvs = async ({
  mediateurId,
  rdvAccount,
  appendLog,
  batchSize = 250,
  organisationIds,
}: {
  rdvAccount: OAuthRdvApiCredentialsWithId
  mediateurId: string
  appendLog: AppendLog
  batchSize?: number
  organisationIds?: number[]
}): Promise<{
  rdvs: SyncModelResult & { count: number }
  users: SyncModelResult & { count: number }
  motifs: SyncModelResult & { count: number }
  lieux: SyncModelResult & { count: number }
}> => {
  appendLog('import rdvs')

  // Une liste d'organisations vide veut dire « aucune », pas « toutes » : c'est
  // le cas des comptes dont aucune installation de webhook n'a échoué.
  if (organisationIds && organisationIds.length === 0) {
    appendLog('import rdvs skipped: aucune organisation à synchroniser')
    return resultatVide
  }

  const row = await prismaClient.rdvAccount.findUniqueOrThrow({
    where: { id: rdvAccount.id },
    include: { organisations: { select: { organisationId: true } } },
  })

  const compte = compteRdvToDomain(row)

  if (!estUtilisable(compte)) {
    appendLog('import rdvs skipped: compte non lié')
    return resultatVide
  }

  const synchroniser = synchroniserRdvs({
    listerRdvs: rdvServicePublicApiBinding.listerRdvs,
    rdvsDejaImportes,
    etatConnuDuLot,
    appliquerPlan: appliquerPlanLot,
    supprimerRdvs,
    rapprocherBeneficiaires: rapprocherBeneficiaires({
      mediateurId,
      journaliser: appendLog,
    }),
    tailleLot: batchSize,
  })

  const bilan = await synchroniser({
    compte,
    organisationIds: organisationIds?.map((id) => OrganisationId(id)),
  })

  if (!bilan.success) {
    appendLog(`import rdvs failed: ${bilan.error._tag}`)
    throw new Error(
      `Impossible de synchroniser les rendez-vous (${bilan.error._tag})`,
    )
  }

  appendLog(
    `imported ${bilan.data.rdvs.count} rdvs, ${bilan.data.rdvs.noop} noop, ${bilan.data.rdvs.updated} updated, ${bilan.data.rdvs.created} created, ${bilan.data.rdvs.deleted} deleted`,
  )
  appendLog(
    `imported ${bilan.data.usagers.count} users, ${bilan.data.motifs.count} motifs, ${bilan.data.lieux.count} lieux`,
  )

  return {
    rdvs: bilan.data.rdvs,
    users: bilan.data.usagers,
    motifs: bilan.data.motifs,
    lieux: bilan.data.lieux,
  }
}
