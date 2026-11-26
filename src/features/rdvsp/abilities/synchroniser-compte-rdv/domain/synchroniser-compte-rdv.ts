import type {
  BilanModele,
  BilanSynchronisation,
} from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import {
  bilanSynchronisationVide,
  bilanVide,
  deriveTotale,
} from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { ErreurRdvApi } from '@/features/rdvsp/domain/errors'
import { diagnosticErreur } from '@/features/rdvsp/domain/errors'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { organisationsAccessibles } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { Result } from '@/libraries/result'
import { success } from '@/libraries/result'

export type PorteeDemandee = {
  readonly compte: CompteRdvUtilisable
  /**
   * Organisations à synchroniser. Absente, la passe couvre tout ; **vide**, elle
   * ne couvre rien — c'est le cas d'un compte dont aucune installation de webhook
   * n'a échoué, pour lequel l'appelant n'a rien à demander.
   */
  readonly organisationIds?: readonly OrganisationId[]
}

export type PasseDeSynchronisation =
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
export const passePour = ({
  organisationIds,
}: PorteeDemandee): PasseDeSynchronisation => {
  if (organisationIds !== undefined && organisationIds.length === 0) {
    return { _tag: 'sansObjet' }
  }

  return {
    _tag: 'aExecuter',
    toutesOrganisations: organisationIds === undefined,
    organisationIds,
  }
}

export type ResultatSynchronisation = {
  readonly bilan: BilanSynchronisation
  readonly derive: number
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}

export type SynchroniserCompteRdv = (
  portee: PorteeDemandee,
) => Promise<Result<ResultatSynchronisation, ErreurRdvApi>>

export type ReconcilierOrganisations = (compte: CompteRdvUtilisable) => Promise<
  Result<
    {
      readonly bilan: BilanModele
      readonly organisationIdsRecues: readonly OrganisationId[]
    },
    ErreurRdvApi
  >
>

export type ReconcilierRdvs = (input: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<
  Result<
    {
      readonly rdvs: BilanModele
      readonly usagers: BilanModele
      readonly motifs: BilanModele
      readonly lieux: BilanModele
      readonly organisationIdsInaccessibles: readonly OrganisationId[]
    },
    ErreurRdvApi
  >
>

export type ReconcilierLesRdvsDuMediateur = (rattachement: {
  readonly mediateurId: string
}) => ReconcilierRdvs

export type DetacherOrganisations = (input: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds: readonly OrganisationId[]
}) => Promise<void>

const compteVuParLaPasse = (
  compte: CompteRdvUtilisable,
  organisationIdsRecues: readonly OrganisationId[] | null,
): CompteRdvUtilisable =>
  organisationIdsRecues === null
    ? compte
    : { ...compte, organisationIds: organisationIdsRecues }

export type ReconcilierWebhooks = (input: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<{
  readonly bilan: BilanModele
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}>

/**
 * Trace d'exécution, ouverte au démarrage et refermée à l'arrivée.
 *
 * La portée y est consignée dès l'ouverture : une passe restreinte ne mesure la
 * dérive que des organisations qu'elle a parcourues, et la lire comme une dérive
 * globale la sous-estime. Sans cette information, les deux sont indiscernables
 * dans `rdv_sync_logs` — c'est pourtant lui que l'administration surveille.
 * `undefined` vaut « toutes les organisations ».
 */
export type OuvrirJournal = (input: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<{ readonly journalId: string }>

export type CloturerJournal = (input: {
  readonly journalId: string
  readonly resultat: ResultatSynchronisation
  readonly journal: string
}) => Promise<void>

export type EchouerJournal = (input: {
  readonly journalId: string
  readonly message: string
  readonly journal: string
}) => Promise<void>

export type DependancesSynchroniserCompteRdv = {
  readonly reconcilierOrganisations: ReconcilierOrganisations
  readonly reconcilierRdvs: ReconcilierRdvs
  readonly reconcilierWebhooks: ReconcilierWebhooks
  readonly detacherOrganisations: DetacherOrganisations
  readonly ouvrirJournal: OuvrirJournal
  readonly cloturerJournal: CloturerJournal
  readonly echouerJournal: EchouerJournal
}

const sansObjet: ResultatSynchronisation = {
  bilan: bilanSynchronisationVide,
  derive: 0,
  organisationIdsSansWebhook: undefined,
}

/**
 * Réconcilie un compte avec RDV Service Public.
 *
 * L'ordre n'est pas indifférent : les organisations d'abord, dont les rendez-vous
 * dépendent ; les rendez-vous ensuite, qui amènent motifs, lieux et usagers ; les
 * webhooks en dernier, pour que les notifications reprennent sur un état à jour.
 *
 * Un échec est consigné puis propagé. La trace vaut mieux que le silence : c'est
 * elle que l'administration lit quand un compte cesse de se synchroniser.
 */
export const synchroniserCompteRdv =
  ({
    reconcilierOrganisations,
    reconcilierRdvs,
    reconcilierWebhooks,
    detacherOrganisations,
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
  }: DependancesSynchroniserCompteRdv): SynchroniserCompteRdv =>
  async (portee: PorteeDemandee) => {
    const passe = passePour(portee)

    if (passe._tag === 'sansObjet') {
      return success(sansObjet)
    }

    const { compte } = portee
    const { journalId } = await ouvrirJournal({
      compte,
      ...(passe.organisationIds === undefined
        ? {}
        : { organisationIds: passe.organisationIds }),
    })
    const lignes: string[] = []
    const tracer = (message: string) => {
      lignes.push(message)
    }

    try {
      // Chaque étape s'annonce avant d'agir, et rend compte après. Ne tracer
      // qu'au succès laissait un journal vide quand la première étape tombait —
      // exactement le cas où on a besoin de savoir où on en était.
      tracer(
        passe.toutesOrganisations
          ? 'réconciliation des organisations'
          : 'organisations non réconciliées (passe restreinte)',
      )

      const organisations = passe.toutesOrganisations
        ? await reconcilierOrganisations(compte)
        : success({ bilan: bilanVide, organisationIdsRecues: null })

      if (!organisations.success) {
        await echouerJournal({
          journalId,
          message: diagnosticErreur(organisations.error),
          journal: lignes.join('\n'),
        })
        return organisations
      }

      tracer('organisations réconciliées')
      tracer('réconciliation des rendez-vous')

      const rdvs = await reconcilierRdvs({
        compte,
        ...(passe.organisationIds === undefined
          ? {}
          : { organisationIds: passe.organisationIds }),
      })

      if (!rdvs.success) {
        await echouerJournal({
          journalId,
          message: diagnosticErreur(rdvs.error),
          journal: lignes.join('\n'),
        })
        return rdvs
      }

      tracer('rendez-vous réconciliés')

      const { organisationIdsInaccessibles } = rdvs.data

      if (organisationIdsInaccessibles.length > 0) {
        tracer(
          `organisations inaccessibles détachées : ${organisationIdsInaccessibles.join(', ')}`,
        )
        await detacherOrganisations({
          compte,
          organisationIds: organisationIdsInaccessibles,
        })
      }

      tracer('installation des webhooks')

      const organisationIdsAccessibles = organisationsAccessibles(
        passe.organisationIds,
        organisationIdsInaccessibles,
      )

      const webhooks = await reconcilierWebhooks({
        compte: compteVuParLaPasse(
          compte,
          organisations.data.organisationIdsRecues,
        ),
        ...(organisationIdsAccessibles === undefined
          ? {}
          : { organisationIds: organisationIdsAccessibles }),
      })

      tracer('webhooks installés')

      const bilan = {
        organisations: organisations.data.bilan,
        rdvs: rdvs.data.rdvs,
        users: rdvs.data.usagers,
        motifs: rdvs.data.motifs,
        lieux: rdvs.data.lieux,
        webhooks: webhooks.bilan,
      }

      const resultat: ResultatSynchronisation = {
        bilan,
        derive: deriveTotale(bilan),
        organisationIdsSansWebhook: webhooks.organisationIdsSansWebhook,
      }

      await cloturerJournal({
        journalId,
        resultat,
        journal: lignes.join('\n'),
      })

      return success(resultat)
    } catch (erreur) {
      await echouerJournal({
        journalId,
        message: erreur instanceof Error ? erreur.message : String(erreur),
        journal: lignes.join('\n'),
      })
      throw erreur
    }
  }
