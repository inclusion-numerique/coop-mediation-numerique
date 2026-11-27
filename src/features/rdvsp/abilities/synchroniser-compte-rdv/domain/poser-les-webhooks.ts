import {
  type EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import type {
  BilanModele,
  OperationSynchronisation,
} from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { PorteeDeSynchronisation } from '../../../domain/portee-de-synchronisation'
import { abonnementsDeLaCoop, estAJour } from '../../../domain/webhook/webhook'
import type { PoserLesWebhooksPorts, PoserUnWebhookPorts } from './ports'
import type { OrganisationsSansWebhook } from './resultat-synchronisation'

export type PoseDeWebhook = {
  readonly organisationId: OrganisationId
  readonly operation: Exclude<OperationSynchronisation, 'deleted'>
  readonly invalide: boolean
}

export type PosesDeWebhooks = {
  readonly poses: readonly PoseDeWebhook[]
  readonly bilan: BilanModele
  readonly organisationsSansWebhook: OrganisationsSansWebhook
}

const pose = (
  organisationId: OrganisationId,
  operation: PoseDeWebhook['operation'],
  invalide: boolean,
): PoseDeWebhook => ({ organisationId, operation, invalide })

const poserUnWebhook =
  ({
    listerWebhooksDeLaCoop,
    poserWebhook,
    relireWebhooksDeLaCoop,
    reconfigurerWebhook,
    destinationDesWebhooksJoignable,
  }: PoserUnWebhookPorts) =>
  async ({
    compte,
    organisationId,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly organisationId: OrganisationId
  }): Promise<PoseDeWebhook> => {
    const existants = await listerWebhooksDeLaCoop(compte, organisationId)

    if (!existants.success) return pose(organisationId, 'noop', true)

    const [existant] = existants.data

    if (existant !== undefined && estAJour(existant, abonnementsDeLaCoop))
      return pose(organisationId, 'noop', false)

    if (existant !== undefined) {
      const reconfigure = await reconfigurerWebhook(
        compte,
        organisationId,
        existant.id,
        abonnementsDeLaCoop,
      )

      return reconfigure.success
        ? pose(organisationId, 'updated', false)
        : pose(organisationId, 'noop', true)
    }

    if (!destinationDesWebhooksJoignable())
      return pose(organisationId, 'noop', false)

    const cree = await poserWebhook(compte, organisationId, abonnementsDeLaCoop)

    if (!cree.success) return pose(organisationId, 'noop', true)

    const apresPose = await relireWebhooksDeLaCoop(compte, organisationId)

    return apresPose.success && apresPose.data.length > 0
      ? pose(organisationId, 'created', false)
      : pose(organisationId, 'noop', true)
  }

const compter = (
  poses: readonly PoseDeWebhook[],
  operation: PoseDeWebhook['operation'],
): number => poses.filter((une) => une.operation === operation).length

const dansLaPortee = (
  portee: PorteeDeSynchronisation,
  organisationId: OrganisationId,
): boolean =>
  portee._tag === 'toutesOrganisations' ||
  portee.organisationIds.includes(organisationId)

export const poserLesWebhooks =
  ({ noterLesWebhooksInvalides, ...portsDeLaPose }: PoserLesWebhooksPorts) =>
  async ({
    compte,
    portee,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly portee: PorteeDeSynchronisation
  }): Promise<Result<PosesDeWebhooks, EchecTechnique>> => {
    const poses = await Promise.all(
      compte.organisationIds
        .filter((organisationId) => dansLaPortee(portee, organisationId))
        .map((organisationId) =>
          poserUnWebhook(portsDeLaPose)({ compte, organisationId }),
        ),
    )

    const bilan: BilanModele = {
      noop: compter(poses, 'noop'),
      created: compter(poses, 'created'),
      updated: compter(poses, 'updated'),
      deleted: 0,
    }

    if (portee._tag === 'organisations')
      return success({
        poses,
        bilan,
        organisationsSansWebhook: { _tag: 'nonRelevees' },
      })

    const organisationIds = poses
      .filter((une) => une.invalide)
      .map((une) => une.organisationId)

    const notees = await noterLesWebhooksInvalides({
      agentId: compte.agentId,
      organisationIds,
    })

    return notees.success
      ? success({
          poses,
          bilan,
          organisationsSansWebhook: { _tag: 'relevees', organisationIds },
        })
      : failure(notees.error)
  }
