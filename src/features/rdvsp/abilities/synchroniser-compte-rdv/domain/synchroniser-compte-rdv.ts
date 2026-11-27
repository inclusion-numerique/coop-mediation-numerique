import {
  type BilanSynchronisation,
  bilanVide,
  deriveTotale,
} from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  type EchecDeSynchronisation,
  messageDeLEchec,
} from '@/features/rdvsp/domain/errors'
import type { MediateurId } from '@/features/rdvsp/domain/identifiants/mediateur-id'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import {
  type PorteeDeSynchronisation,
  porteeAccessible,
} from '@/features/rdvsp/domain/portee-de-synchronisation'
import type { Rapprochement } from '@/features/rdvsp/domain/rapprochement'
import { TAILLE_DES_LOTS_DE_RDVS } from '@/features/rdvsp/domain/rdv/taille-des-lots'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeSynchroniserCompteRdv } from './errors'
import type { ReconcilierRdvs, SynchroniserCompteRdvPorts } from './ports'
import type { PoseDeWebhook } from './poser-les-webhooks'
import { poserLesWebhooks } from './poser-les-webhooks'
import type { ResultatSynchronisation } from './resultat-synchronisation'

export type CompteSynchronise =
  | {
      readonly _tag: 'sansObjet'
      readonly derive: 0
      readonly synchroniseeLe: Date
    }
  | (ResultatSynchronisation & {
      readonly _tag: 'synchronise'
      readonly synchroniseeLe: Date
      readonly organisationIdsDetachees: readonly OrganisationId[]
      readonly webhooks: readonly PoseDeWebhook[]
      readonly rapprochements: readonly Rapprochement[]
      readonly journal: string
    })

const estSansObjet = (portee: PorteeDeSynchronisation): boolean =>
  portee._tag === 'organisations' && portee.organisationIds.length === 0

const sansObjet = (maintenant: Date): CompteSynchronise => ({
  _tag: 'sansObjet',
  derive: 0,
  synchroniseeLe: maintenant,
})

const bilanRdvsVide = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  organisationIdsInaccessibles: [],
  rapprochements: [],
}

const rdvsDuMediateur = (
  reconcilierRdvs: ReconcilierRdvs,
  compte: CompteRdvUtilisable,
  portee: PorteeDeSynchronisation,
  mediateurId: MediateurId | null,
  maintenant: Date,
): ReturnType<ReconcilierRdvs> =>
  mediateurId === null
    ? Promise.resolve(success(bilanRdvsVide))
    : reconcilierRdvs({
        compte,
        portee,
        mediateurId,
        tailleLot: TAILLE_DES_LOTS_DE_RDVS,
        maintenant,
      })

const organisationsDeLaPasse = (
  portee: PorteeDeSynchronisation,
  reconcilier: SynchroniserCompteRdvPorts['reconcilierOrganisations'],
  compte: CompteRdvUtilisable,
): ReturnType<SynchroniserCompteRdvPorts['reconcilierOrganisations']> =>
  portee._tag === 'toutesOrganisations'
    ? reconcilier({ compte })
    : Promise.resolve(
        success({
          bilan: bilanVide,
          organisationIdsRecues: compte.organisationIds,
        }),
      )

export const synchroniserCompteRdv =
  ({
    reconcilierOrganisations,
    reconcilierRdvs,
    listerWebhooksDeLaCoop,
    poserWebhook,
    relireWebhooksDeLaCoop,
    reconfigurerWebhook,
    destinationDesWebhooksJoignable,
    noterLesWebhooksInvalides,
    detacherOrganisations,
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
    noterLaSynchronisationReussie,
  }: SynchroniserCompteRdvPorts) =>
  async ({
    compte,
    mediateurId,
    portee,
    maintenant,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly mediateurId: MediateurId | null
    readonly portee: PorteeDeSynchronisation
    readonly maintenant: Date
  }): Promise<Result<CompteSynchronise, EchecDeSynchroniserCompteRdv>> => {
    const synchronisation = estSansObjet(portee)
      ? success(sansObjet(maintenant))
      : await (async (): Promise<
          Result<CompteSynchronise, EchecDeSynchroniserCompteRdv>
        > => {
          const ouverture = await ouvrirJournal({
            compte,
            portee,
            ouvertLe: maintenant,
          })

          if (!ouverture.success) return ouverture

          const { journalId } = ouverture.data

          const echouer = async (
            echec: EchecDeSynchronisation,
            lignes: readonly string[],
          ): Promise<Result<never, EchecDeSynchroniserCompteRdv>> => {
            const consigne = await echouerJournal({
              journalId,
              message: messageDeLEchec(echec),
              journal: lignes.join('\n'),
            })

            return consigne.success ? failure(echec) : consigne
          }

          const traceOrganisations = [
            portee._tag === 'toutesOrganisations'
              ? 'réconciliation des organisations'
              : 'organisations non réconciliées (passe restreinte)',
          ]

          const organisations = await organisationsDeLaPasse(
            portee,
            reconcilierOrganisations,
            compte,
          )

          if (!organisations.success)
            return echouer(organisations.error, traceOrganisations)

          const traceRdvs = [
            ...traceOrganisations,
            'organisations réconciliées',
            'réconciliation des rendez-vous',
          ]

          const rdvs = await rdvsDuMediateur(
            reconcilierRdvs,
            compte,
            portee,
            mediateurId,
            maintenant,
          )

          if (!rdvs.success) return echouer(rdvs.error, traceRdvs)

          const { organisationIdsInaccessibles } = rdvs.data

          const traceDetachement = [
            ...traceRdvs,
            'rendez-vous réconciliés',
            ...(organisationIdsInaccessibles.length > 0
              ? [
                  `organisations inaccessibles détachées : ${organisationIdsInaccessibles.join(', ')}`,
                ]
              : []),
          ]

          const detachement =
            organisationIdsInaccessibles.length > 0
              ? await detacherOrganisations({
                  compte,
                  organisationIds: organisationIdsInaccessibles,
                })
              : success(undefined)

          if (!detachement.success)
            return echouer(detachement.error, traceDetachement)

          const traceWebhooks = [
            ...traceDetachement,
            'installation des webhooks',
          ]

          const webhooks = await poserLesWebhooks({
            listerWebhooksDeLaCoop,
            poserWebhook,
            relireWebhooksDeLaCoop,
            reconfigurerWebhook,
            destinationDesWebhooksJoignable,
            noterLesWebhooksInvalides,
          })({
            compte: {
              ...compte,
              organisationIds: organisations.data.organisationIdsRecues,
            },
            portee: porteeAccessible(portee, organisationIdsInaccessibles),
          })

          if (!webhooks.success) return echouer(webhooks.error, traceWebhooks)

          const traceCloture = [...traceWebhooks, 'webhooks installés']

          const bilan: BilanSynchronisation = {
            organisations: organisations.data.bilan,
            rdvs: rdvs.data.rdvs,
            users: rdvs.data.usagers,
            motifs: rdvs.data.motifs,
            lieux: rdvs.data.lieux,
            webhooks: webhooks.data.bilan,
          }

          const resultat: ResultatSynchronisation = {
            bilan,
            derive: deriveTotale(bilan),
            organisationsSansWebhook: webhooks.data.organisationsSansWebhook,
          }

          const journal = traceCloture.join('\n')

          const cloture = await cloturerJournal({
            journalId,
            resultat,
            journal,
          })

          if (!cloture.success) return echouer(cloture.error, traceCloture)

          return success({
            _tag: 'synchronise',
            ...resultat,
            synchroniseeLe: maintenant,
            organisationIdsDetachees: organisationIdsInaccessibles,
            webhooks: webhooks.data.poses,
            rapprochements: rdvs.data.rapprochements,
            journal,
          })
        })()

    if (!synchronisation.success) return synchronisation

    const reussite = await noterLaSynchronisationReussie({
      agentId: compte.agentId,
      synchroniseeLe: synchronisation.data.synchroniseeLe,
    })

    return reussite.success ? synchronisation : reussite
  }
