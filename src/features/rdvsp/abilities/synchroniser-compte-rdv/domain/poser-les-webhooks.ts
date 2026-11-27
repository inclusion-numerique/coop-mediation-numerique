import type { EchecTechnique } from '@/libraries/result'
import { failure, type Result, success } from '@/libraries/result'
import type {
  BilanModele,
  OperationSynchronisation,
} from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { abonnementsDeLaCoop, estAJour } from '../../../domain/webhook/webhook'
import type { SynchroniserCompteRdvPorts } from './ports'

export type PoseDeWebhook = {
  readonly organisationId: OrganisationId
  readonly operation: Exclude<OperationSynchronisation, 'deleted'>
  readonly invalide: boolean
}

export type PosesDeWebhooks = {
  readonly poses: readonly PoseDeWebhook[]
  readonly bilan: BilanModele
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}

type PortsDesWebhooks = Pick<
  SynchroniserCompteRdvPorts,
  | 'listerWebhooksDeLaCoop'
  | 'poserWebhook'
  | 'relireWebhooksDeLaCoop'
  | 'reconfigurerWebhook'
  | 'destinationDesWebhooksJoignable'
  | 'noterLesWebhooksInvalides'
>

const pose = (
  organisationId: OrganisationId,
  operation: PoseDeWebhook['operation'],
  invalide: boolean,
): PoseDeWebhook => ({ organisationId, operation, invalide })

const poserUnWebhook = async (
  ports: PortsDesWebhooks,
  compte: CompteRdvUtilisable,
  organisationId: OrganisationId,
): Promise<PoseDeWebhook> => {
  const existants = await ports.listerWebhooksDeLaCoop(compte, organisationId)

  if (!existants.success) return pose(organisationId, 'noop', true)

  const [existant] = existants.data

  if (existant !== undefined && estAJour(existant, abonnementsDeLaCoop))
    return pose(organisationId, 'noop', false)

  if (existant !== undefined) {
    const reconfigure = await ports.reconfigurerWebhook(
      compte,
      organisationId,
      existant.id,
      abonnementsDeLaCoop,
    )

    return reconfigure.success
      ? pose(organisationId, 'updated', false)
      : pose(organisationId, 'noop', true)
  }

  if (!ports.destinationDesWebhooksJoignable())
    return pose(organisationId, 'noop', false)

  const cree = await ports.poserWebhook(
    compte,
    organisationId,
    abonnementsDeLaCoop,
  )

  if (!cree.success) return pose(organisationId, 'noop', true)

  const apresPose = await ports.relireWebhooksDeLaCoop(compte, organisationId)

  return apresPose.success && apresPose.data.length > 0
    ? pose(organisationId, 'created', false)
    : pose(organisationId, 'noop', true)
}

const compter = (
  poses: readonly PoseDeWebhook[],
  operation: PoseDeWebhook['operation'],
): number => poses.filter((une) => une.operation === operation).length

export const poserLesWebhooks = async (
  ports: PortsDesWebhooks,
  {
    compte,
    organisationIds,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly organisationIds: readonly OrganisationId[] | undefined
  },
): Promise<Result<PosesDeWebhooks, EchecTechnique>> => {
  const poses = await Promise.all(
    compte.organisationIds
      .filter(
        (organisationId) =>
          organisationIds === undefined ||
          organisationIds.includes(organisationId),
      )
      .map((organisationId) => poserUnWebhook(ports, compte, organisationId)),
  )

  const bilan: BilanModele = {
    noop: compter(poses, 'noop'),
    created: compter(poses, 'created'),
    updated: compter(poses, 'updated'),
    deleted: 0,
  }

  if (organisationIds !== undefined)
    return success({ poses, bilan, organisationIdsSansWebhook: undefined })

  const organisationIdsSansWebhook = poses
    .filter((une) => une.invalide)
    .map((une) => une.organisationId)

  const notees = await ports.noterLesWebhooksInvalides({
    agentId: compte.agentId,
    organisationIds: organisationIdsSansWebhook,
  })

  return notees.success
    ? success({ poses, bilan, organisationIdsSansWebhook })
    : failure(notees.error)
}
