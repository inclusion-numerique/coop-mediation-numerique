import {
  type BilanSynchronisation,
  bilanSynchronisationVide,
  bilanVide,
  deriveTotale,
} from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  type EchecDeSynchronisation,
  messageDeLEchec,
} from '@/features/rdvsp/domain/errors'
import {
  type OrganisationId,
  organisationsAccessibles,
} from '@/features/rdvsp/domain/identifiants/organisation-id'
import { TAILLE_DES_LOTS_DE_RDVS } from '@/features/rdvsp/domain/rdv/taille-des-lots'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeSynchroniserCompteRdv } from './errors'
import type { ReconcilierRdvs, SynchroniserCompteRdvPorts } from './ports'
import type { PoseDeWebhook } from './poser-les-webhooks'
import { poserLesWebhooks } from './poser-les-webhooks'
import type { ResultatSynchronisation } from './resultat-synchronisation'

export type CompteSynchronise = ResultatSynchronisation & {
  readonly organisationIdsDetachees: readonly OrganisationId[]
  readonly webhooks: readonly PoseDeWebhook[]
}

type PasseDeSynchronisation =
  | { readonly _tag: 'sansObjet' }
  | {
      readonly _tag: 'aExecuter'
      readonly toutesOrganisations: boolean
      readonly organisationIds: readonly OrganisationId[] | undefined
    }

/**
 * Une portée vide n'est pas une portée totale.
 *
 * La distinction tient à un tableau vide contre une absence de tableau, et
 * l'inverser ferait resynchroniser l'intégralité d'un compte là où il n'y avait
 * rien à faire. Elle méritait d'être nommée.
 *
 * Les organisations ne sont réconciliées que lors d'une passe complète : sur une
 * portée restreinte, l'appelant sait déjà de quelles organisations il parle.
 */
const passePour = (
  organisationIds: readonly OrganisationId[] | undefined,
): PasseDeSynchronisation =>
  organisationIds !== undefined && organisationIds.length === 0
    ? { _tag: 'sansObjet' }
    : {
        _tag: 'aExecuter',
        toutesOrganisations: organisationIds === undefined,
        organisationIds,
      }

const sansObjet: CompteSynchronise = {
  bilan: bilanSynchronisationVide,
  derive: 0,
  organisationIdsSansWebhook: undefined,
  organisationIdsDetachees: [],
  webhooks: [],
}

const bilanRdvsVide = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  organisationIdsInaccessibles: [],
}

const avecPortee = (organisationIds: readonly OrganisationId[] | undefined) =>
  organisationIds === undefined ? {} : { organisationIds }

const rdvsDuMediateur = (
  reconcilierRdvs: ReconcilierRdvs,
  compte: CompteRdvUtilisable,
  organisationIds: readonly OrganisationId[] | undefined,
  mediateurId: string | null,
): ReturnType<ReconcilierRdvs> =>
  mediateurId === null
    ? Promise.resolve(success(bilanRdvsVide))
    : reconcilierRdvs({
        compte,
        ...avecPortee(organisationIds),
        mediateurId,
        tailleLot: TAILLE_DES_LOTS_DE_RDVS,
      })

const organisationsDeLaPasse = (
  toutesOrganisations: boolean,
  reconcilier: SynchroniserCompteRdvPorts['reconcilierOrganisations'],
  compte: CompteRdvUtilisable,
): ReturnType<SynchroniserCompteRdvPorts['reconcilierOrganisations']> =>
  toutesOrganisations
    ? reconcilier({ compte })
    : Promise.resolve(
        success({
          bilan: bilanVide,
          organisationIdsRecues: compte.organisationIds,
        }),
      )

/**
 * Réconcilie un compte avec RDV Service Public.
 *
 * L'ordre n'est pas indifférent : les organisations d'abord, dont les rendez-vous
 * dépendent ; les rendez-vous ensuite, qui amènent motifs, lieux et usagers ; les
 * webhooks en dernier, pour que les notifications reprennent sur un état à jour.
 *
 * Un échec est consigné puis rendu. La trace vaut mieux que le silence : c'est
 * elle que l'administration lit quand un compte cesse de se synchroniser.
 */
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
    organisationIds,
  }: {
    readonly compte: CompteRdvUtilisable
    readonly mediateurId: string | null
    readonly organisationIds?: readonly OrganisationId[]
  }): Promise<Result<CompteSynchronise, EchecDeSynchroniserCompteRdv>> => {
    const passe = passePour(organisationIds)

    const synchronisation =
      passe._tag === 'sansObjet'
        ? success(sansObjet)
        : await (async (): Promise<
            Result<CompteSynchronise, EchecDeSynchroniserCompteRdv>
          > => {
            const ouverture = await ouvrirJournal({
              compte,
              ...avecPortee(passe.organisationIds),
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
              passe.toutesOrganisations
                ? 'réconciliation des organisations'
                : 'organisations non réconciliées (passe restreinte)',
            ]

            const organisations = await organisationsDeLaPasse(
              passe.toutesOrganisations,
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
              passe.organisationIds,
              mediateurId,
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

            const webhooks = await poserLesWebhooks(
              {
                listerWebhooksDeLaCoop,
                poserWebhook,
                relireWebhooksDeLaCoop,
                reconfigurerWebhook,
                destinationDesWebhooksJoignable,
                noterLesWebhooksInvalides,
              },
              {
                compte: {
                  ...compte,
                  organisationIds: organisations.data.organisationIdsRecues,
                },
                organisationIds: organisationsAccessibles(
                  passe.organisationIds,
                  organisationIdsInaccessibles,
                ),
              },
            )

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
              organisationIdsSansWebhook:
                webhooks.data.organisationIdsSansWebhook,
            }

            const cloture = await cloturerJournal({
              journalId,
              resultat,
              journal: traceCloture.join('\n'),
            })

            if (!cloture.success) return echouer(cloture.error, traceCloture)

            return success({
              ...resultat,
              organisationIdsDetachees: organisationIdsInaccessibles,
              webhooks: webhooks.data.poses,
            })
          })()

    if (!synchronisation.success) return synchronisation

    const reussite = await noterLaSynchronisationReussie({
      agentId: compte.agentId,
      organisationIdsSansWebhook:
        synchronisation.data.organisationIdsSansWebhook,
    })

    return reussite.success ? synchronisation : reussite
  }
