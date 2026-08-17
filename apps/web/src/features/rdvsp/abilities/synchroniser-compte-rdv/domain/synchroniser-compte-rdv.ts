import type { Result } from '@app/web/libraries/result'
import type {
  BilanModele,
  BilanSynchronisation,
} from '../../../domain/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte-rdv'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/organisation-id'

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

/** Chacune des trois réconciliations, déclarée ici et câblée à l'extérieur. */
export type ReconcilierOrganisations = (
  compte: CompteRdvUtilisable,
) => Promise<Result<BilanModele, ErreurRdvApi>>

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
    },
    ErreurRdvApi
  >
>

export type ReconcilierWebhooks = (input: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<{
  readonly bilan: BilanModele
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}>

/** Trace d'exécution, ouverte au démarrage et refermée à l'arrivée. */
export type OuvrirJournal = (
  compte: CompteRdvUtilisable,
) => Promise<{ readonly journalId: string }>

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
