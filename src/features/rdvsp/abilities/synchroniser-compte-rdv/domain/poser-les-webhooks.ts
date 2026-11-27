import {
  type EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import type { BilanModele } from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { PorteeDeSynchronisation } from '../../../domain/portee-de-synchronisation'
import { abonnementsDeLaCoop, estAJour } from '../../../domain/webhook/webhook'
import type { PoserLesWebhooksPorts, PoserUnWebhookPorts } from './ports'
import type { OrganisationsSansWebhook } from './resultat-synchronisation'

export type PoseDeWebhook = {
  readonly _tag: 'inchange' | 'reconfigure' | 'cree' | 'manquant'
  readonly organisationId: OrganisationId
}

export type PosesDeWebhooks = {
  readonly poses: readonly PoseDeWebhook[]
  readonly bilan: BilanModele
  readonly organisationsSansWebhook: OrganisationsSansWebhook
}

const pose = (
  organisationId: OrganisationId,
  issue: PoseDeWebhook['_tag'],
): PoseDeWebhook => ({ _tag: issue, organisationId })

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

    if (!existants.success) return pose(organisationId, 'manquant')

    const [existant] = existants.data

    if (existant !== undefined && estAJour(existant, abonnementsDeLaCoop))
      return pose(organisationId, 'inchange')

    if (existant !== undefined) {
      const reconfigure = await reconfigurerWebhook(
        compte,
        organisationId,
        existant.id,
        abonnementsDeLaCoop,
      )

      return reconfigure.success
        ? pose(organisationId, 'reconfigure')
        : pose(organisationId, 'manquant')
    }

    if (!destinationDesWebhooksJoignable())
      return pose(organisationId, 'inchange')

    const cree = await poserWebhook(compte, organisationId, abonnementsDeLaCoop)

    if (!cree.success) return pose(organisationId, 'manquant')

    const apresPose = await relireWebhooksDeLaCoop(compte, organisationId)

    return apresPose.success && apresPose.data.length > 0
      ? pose(organisationId, 'cree')
      : pose(organisationId, 'manquant')
  }

const compter = (
  poses: readonly PoseDeWebhook[],
  issues: readonly PoseDeWebhook['_tag'][],
): number => poses.filter((une) => issues.includes(une._tag)).length

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
      noop: compter(poses, ['inchange', 'manquant']),
      created: compter(poses, ['cree']),
      updated: compter(poses, ['reconfigure']),
      deleted: 0,
    }

    if (portee._tag === 'organisations')
      return success({
        poses,
        bilan,
        organisationsSansWebhook: { _tag: 'nonRelevees' },
      })

    const organisationIds = poses
      .filter((une) => une._tag === 'manquant')
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
