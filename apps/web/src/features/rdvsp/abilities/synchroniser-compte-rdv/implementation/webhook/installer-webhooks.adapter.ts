import { prismaClient } from '@app/web/prismaClient'
import { getServerUrl } from '@app/web/utils/baseUrl'
import type {
  BilanModele,
  OperationSynchronisation,
} from '../../../../domain/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../../domain/compte-rdv'
import type { OrganisationId } from '../../../../domain/organisation-id'
import type { RdvServicePublicApi } from '../../../../domain/rdv-service-public.port'
import { abonnementsDeLaCoop, estAJour } from '../../../../domain/webhook'
import { rdvServicePublicApiBinding } from '../../../../implementation/rdv-service-public.bindings'

/** Journal de la passe, tenu par l'orchestrateur qui appelle cet adaptateur. */
export type AppendLog = (log: string | string[]) => void

type PoseSurUneOrganisation = {
  syncOperation: OperationSynchronisation
  invalidInstallation: boolean
  organisationId: number
}

const webhookUrl = getServerUrl('/api/rdv-service-public/webhook', {
  absolutePath: true,
})

/**
 * En local, l'URL de destination n'est pas joignable depuis RDV Service Public :
 * poser le webhook enverrait des notifications dans le vide, et surtout
 * écraserait la pose de l'environnement qui porte réellement ce compte.
 */
const destinationJoignable = (): boolean => !webhookUrl.includes('localhost')

export const installWebhookForOrganisation = async ({
  compte,
  organisationId,
  appendLog,
  api = rdvServicePublicApiBinding,
}: {
  compte: CompteRdvUtilisable
  organisationId: OrganisationId
  appendLog: AppendLog
  api?: RdvServicePublicApi
}): Promise<PoseSurUneOrganisation> => {
  const existants = await api.listerWebhooksDeLaCoop(compte, organisationId)

  if (!existants.success) {
    appendLog(
      `impossible de lire les webhooks de l'organisation ${organisationId} (${existants.error._tag})`,
    )

    return { syncOperation: 'noop', invalidInstallation: true, organisationId }
  }

  appendLog(
    `found ${existants.data.length} webhooks for organisation ${organisationId}`,
  )

  const [existant] = existants.data

  if (existant !== undefined && estAJour(existant)) {
    appendLog(
      `found existing coop endpoint ${existant.id} with all subscriptions, skipping`,
    )

    return { syncOperation: 'noop', invalidInstallation: false, organisationId }
  }

  if (existant !== undefined) {
    appendLog(`updating coop endpoint ${existant.id}`)

    const reconfigure = await api.reconfigurerWebhook(
      compte,
      organisationId,
      existant.id,
      abonnementsDeLaCoop,
    )

    return reconfigure.success
      ? { syncOperation: 'updated', invalidInstallation: false, organisationId }
      : { syncOperation: 'noop', invalidInstallation: true, organisationId }
  }

  if (!destinationJoignable()) {
    appendLog('skipping webhook installation for local environment')

    return { syncOperation: 'noop', invalidInstallation: false, organisationId }
  }

  appendLog(
    `no existing coop endpoint found for organisation ${organisationId}, creating new one`,
  )

  const cree = await api.poserWebhook(
    compte,
    organisationId,
    abonnementsDeLaCoop,
  )

  if (!cree.success) {
    return { syncOperation: 'noop', invalidInstallation: true, organisationId }
  }

  appendLog(`created webhook ${cree.data.id}`)

  // RDV Service Public accepte la création pour un agent qui n'administre pas
  // l'organisation, sans rien créer : seule une relecture dit si la pose a pris.
  const apresPose = await api.listerWebhooksDeLaCoop(compte, organisationId)

  // Une pose non confirmée est comptée `noop` : elle n'a rien changé, et la
  // faire peser sur la dérive donnerait un écart permanent.
  return apresPose.success && apresPose.data.length > 0
    ? { syncOperation: 'created', invalidInstallation: false, organisationId }
    : { syncOperation: 'noop', invalidInstallation: true, organisationId }
}

/**
 * Pose les webhooks d'un compte. Les organisations doivent avoir été
 * synchronisées avant l'appel.
 */
export const installWebhooks = async ({
  compte,
  appendLog,
  organisationIds,
  api = rdvServicePublicApiBinding,
}: {
  compte: CompteRdvUtilisable
  appendLog: AppendLog
  /** Restreint la pose à ces organisations ; une liste vide ne pose rien. */
  organisationIds?: number[]
  api?: RdvServicePublicApi
}): Promise<
  BilanModele & {
    count: number
    /** `null` quand la passe était partielle : rien n'a été vérifié ailleurs. */
    invalidWebhookOrganisationIds: number[] | null
  }
> => {
  appendLog(
    `installing webhooks for account ${compte.agentId} with ${compte.organisationIds.length} organisations`,
  )

  const aTraiter = compte.organisationIds.filter((organisationId) =>
    organisationIds ? organisationIds.includes(organisationId) : true,
  )

  const poses = await Promise.all(
    aTraiter.map((organisationId) =>
      installWebhookForOrganisation({
        compte,
        organisationId,
        appendLog,
        api,
      }),
    ),
  )

  const result: BilanModele = {
    noop: poses.filter((pose) => pose.syncOperation === 'noop').length,
    created: poses.filter((pose) => pose.syncOperation === 'created').length,
    updated: poses.filter((pose) => pose.syncOperation === 'updated').length,
    deleted: 0,
  }

  if (organisationIds) {
    return {
      ...result,
      count: compte.organisationIds.length,
      invalidWebhookOrganisationIds: null,
    }
  }

  const invalidWebhookOrganisationIds = poses
    .filter((pose) => pose.invalidInstallation)
    .map((pose) => pose.organisationId)

  await prismaClient.rdvAccount.update({
    where: { id: compte.agentId },
    data: { invalidWebhookOrganisationIds },
  })

  return {
    ...result,
    count: compte.organisationIds.length,
    invalidWebhookOrganisationIds,
  }
}
