import {
  type CompteRdv,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { Result } from '@/libraries/result'
import { failure, success } from '@/libraries/result'

type RoleDemandeur = 'User' | 'Admin'

export type Demandeur = {
  readonly id: UtilisateurCoopId
  readonly role: RoleDemandeur
}

/**
 * Qui peut déclencher une synchronisation pour qui.
 *
 * Chacun pour soi, l'assistance pour tous : la synchronisation est aussi un
 * geste de dépannage, et l'écran d'administration existe pour cela. La règle
 * vivait dans le routeur, mêlée à la résolution de l'utilisateur.
 */
export const peutDeclencherPour = (
  demandeur: Demandeur,
  cible: UtilisateurCoopId,
): boolean => demandeur.id === cible || demandeur.role === 'Admin'

/**
 * Organisations dont les rendez-vous n'arrivent pas d'eux-mêmes, faute de
 * webhook posé.
 */
const organisationsARattraper = (
  compte: CompteRdv,
): readonly OrganisationId[] => compte.organisationIdsSansWebhook

/**
 * Ce que la passe a effectivement à parcourir.
 *
 * `sansObjet` couvre les deux cas où il n'y a rien à faire — compte sans jetons,
 * ou rattrapage demandé alors que tous les webhooks sont posés — et les sépare de
 * `organisations`, qui restreint la passe. Une liste vide ne doit jamais valoir
 * « tout resynchroniser » : c'est la confusion qu'évite ce type (DM-5).
 */
export type PorteeDeclenchement =
  | { readonly _tag: 'sansObjet' }
  | { readonly _tag: 'toutesOrganisations' }
  | {
      readonly _tag: 'organisations'
      readonly organisationIds: readonly OrganisationId[]
    }

export const peutRelancerUnCompteEnErreur = (demandeur: Demandeur): boolean =>
  demandeur.role === 'Admin'

export const porteePour = (
  compte: CompteRdv,
  seulementSansWebhook: boolean,
  relanceAutorisee: boolean,
): PorteeDeclenchement => {
  if (!estUtilisable(compte)) {
    return { _tag: 'sansObjet' }
  }

  if (
    compte._tag === 'enErreur' &&
    (seulementSansWebhook || !relanceAutorisee)
  ) {
    return { _tag: 'sansObjet' }
  }

  if (!seulementSansWebhook) {
    return { _tag: 'toutesOrganisations' }
  }

  const organisationIds = organisationsARattraper(compte)

  return organisationIds.length === 0
    ? { _tag: 'sansObjet' }
    : { _tag: 'organisations', organisationIds }
}

type ErreurDeclenchement =
  | { readonly _tag: 'NonAutorise' }
  | { readonly _tag: 'CompteRdvIntrouvable' }
  | {
      readonly _tag: 'SynchronisationEchouee'
      readonly marquage: MarquageDEchec | null
    }

const NonAutorise = (): ErreurDeclenchement => ({ _tag: 'NonAutorise' })

const CompteRdvIntrouvable = (): ErreurDeclenchement => ({
  _tag: 'CompteRdvIntrouvable',
})

const SynchronisationEchouee = (
  marquage: MarquageDEchec | null,
): ErreurDeclenchement => ({
  _tag: 'SynchronisationEchouee',
  marquage,
})

type ResultatDeclenchement = {
  /** Nombre d'écarts que la passe a corrigés — zéro vaut « rien n'a bougé ». */
  readonly derive: number
  /** Nul quand la passe était sans objet : aucune synchronisation n'a eu lieu. */
  readonly synchroniseeLe: Date | null
}

export type DeclencherSynchronisation = (input: {
  readonly demandeur: Demandeur
  readonly utilisateurId: UtilisateurCoopId
  /**
   * Restreint la passe aux organisations sans webhook. C'est le mode des écrans
   * qui se rafraîchissent au chargement : ils n'ont à rattraper que ce que les
   * notifications n'ont pas rapporté.
   */
  readonly seulementSansWebhook: boolean
}) => Promise<Result<ResultatDeclenchement, ErreurDeclenchement>>

export type CompteACible = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type SynchroniserUnCompte = (input: {
  readonly compteId: number
  readonly mediateurId?: string
  readonly organisationIds?: number[]
}) => Promise<{ readonly drift: number }>

export type LancerSynchronisation = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<{ readonly derive: number }>

type MarquageDEchec = {
  readonly agentId: RdvAgentId
  readonly message: string
}

export type MarquerEchecDeSynchronisation = (
  marquage: MarquageDEchec,
) => Promise<void>

export type DependancesDeclencherSynchronisation = {
  readonly compteACible: CompteACible
  readonly lancer: LancerSynchronisation
  /** Remontée de l'erreur technique — Sentry en production, rien sous test. */
  readonly signaler?: (erreur: unknown) => void
  /**
   * Un échec qu'un nouvel essai ne résoudra pas. Lui seul justifie de marquer le
   * compte : le drapeau déclenche l'alerte de reconnexion chez le médiateur, et
   * une API momentanément injoignable ne doit pas la lui adresser.
   */
  readonly echecDefinitif?: (erreur: unknown) => boolean
  readonly maintenant?: () => Date
}

/**
 * Message consigné sur le compte, repris tel quel par l'écran d'administration.
 * Il reste volontairement générique : l'erreur technique part vers Sentry, pas
 * vers un médiateur.
 */
export const MESSAGE_ECHEC =
  'Impossible de récupérer les données du compte RDV Service Public'

/**
 * Déclenche une passe de synchronisation à la demande.
 *
 * Le contrôle d'accès précède la lecture du compte : refuser avant de regarder
 * évite de révéler par le message d'erreur qu'un compte existe.
 *
 * Un échec de la passe n'est pas une erreur technique remontée telle quelle : il
 * est consigné sur le compte — c'est ce que lit l'administration — puis rendu
 * comme un échec métier, que l'appelant traduit en message.
 */
export const declencherSynchronisation =
  ({
    compteACible,
    lancer,
    signaler = () => {
      // Remontée facultative.
    },
    echecDefinitif = () => true,
    maintenant = () => new Date(),
  }: DependancesDeclencherSynchronisation): DeclencherSynchronisation =>
  async ({ demandeur, utilisateurId, seulementSansWebhook }) => {
    if (!peutDeclencherPour(demandeur, utilisateurId)) {
      return failure(NonAutorise())
    }

    const compte = await compteACible(utilisateurId)

    if (compte === null) {
      return failure(CompteRdvIntrouvable())
    }

    const portee = porteePour(
      compte,
      seulementSansWebhook,
      peutRelancerUnCompteEnErreur(demandeur),
    )

    if (portee._tag === 'sansObjet') {
      return success({ derive: 0, synchroniseeLe: null })
    }

    try {
      const { derive } = await lancer({
        utilisateurId,
        ...(portee._tag === 'organisations'
          ? { organisationIds: portee.organisationIds }
          : {}),
      })

      return success({ derive, synchroniseeLe: maintenant() })
    } catch (erreur) {
      signaler(erreur)

      return failure(
        SynchronisationEchouee(
          echecDefinitif(erreur)
            ? { agentId: compte.agentId, message: MESSAGE_ECHEC }
            : null,
        ),
      )
    }
  }
