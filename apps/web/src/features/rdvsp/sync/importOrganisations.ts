import { compteRdvToDomain } from '@app/web/features/rdvsp/db'
import { estUtilisable } from '@app/web/features/rdvsp/domain/compte-rdv'
import { prismaClient } from '@app/web/prismaClient'
import type { OAuthRdvApiCredentialsWithId } from '@app/web/rdv-service-public/executeOAuthRdvApiCall'
import { appliquerPlanOrganisations } from '../abilities/synchroniser-organisations/implementation/prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from '../abilities/synchroniser-organisations/implementation/prisma/etat-organisations.query'
import { synchroniserOrganisations } from '../abilities/synchroniser-organisations/implementation/synchroniser-organisations'
import { rdvServicePublicApiBinding } from '../implementation/rdv-service-public.bindings'
import type { AppendLog } from './syncAllRdvData'
import type { SyncModelResult } from './syncLog'

const synchroniser = synchroniserOrganisations({
  listerOrganisations: rdvServicePublicApiBinding.listerOrganisations,
  etatOrganisations,
  appliquerPlan: appliquerPlanOrganisations,
})

/**
 * Adaptateur de transition : l'orchestrateur de synchronisation travaille encore
 * avec les identifiants OAuth bruts, l'ability avec un `CompteRdv`. Ce module
 * relit le compte pour faire le pont, et disparaîtra quand `syncAllRdvData`
 * migrera à son tour.
 */
export const importOrganisations = async ({
  rdvAccount,
  appendLog,
}: {
  rdvAccount: OAuthRdvApiCredentialsWithId
  appendLog: AppendLog
}): Promise<{ result: SyncModelResult; count: number }> => {
  appendLog('import organisations')

  const row = await prismaClient.rdvAccount.findUniqueOrThrow({
    where: { id: rdvAccount.id },
    include: { organisations: { select: { organisationId: true } } },
  })

  const compte = compteRdvToDomain(row)

  if (!estUtilisable(compte)) {
    appendLog('import organisations skipped: compte non lié')
    return {
      result: { noop: 0, created: 0, updated: 0, deleted: 0 },
      count: 0,
    }
  }

  const bilan = await synchroniser(compte)

  if (!bilan.success) {
    appendLog(`import organisations failed: ${bilan.error._tag}`)
    throw new Error(
      `Impossible de synchroniser les organisations (${bilan.error._tag})`,
    )
  }

  appendLog('import organisations success')
  appendLog(`  - noop ${bilan.data.noop} organisations`)
  appendLog(`  - created ${bilan.data.created} organisations`)
  appendLog(`  - updated ${bilan.data.updated} organisations`)
  appendLog(`  - deleted ${bilan.data.deleted} rattachements`)

  return {
    result: {
      noop: bilan.data.noop,
      created: bilan.data.created,
      updated: bilan.data.updated,
      deleted: bilan.data.deleted,
    },
    count: bilan.data.count,
  }
}
