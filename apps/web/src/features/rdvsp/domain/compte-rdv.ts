import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { JetonsOAuth } from './jetons-oauth'
import type { OrganisationId } from './organisation-id'
import type { RdvAgentId } from './rdv-agent-id'
import type { UtilisateurCoopId } from './utilisateur-coop-id'

export const MessageErreurCompte = defineModel(
  z.string().trim().min(1).brand('MessageErreurCompte'),
)
export type MessageErreurCompte = Model.TypeOf<typeof MessageErreurCompte>

type CompteRdvBase = {
  readonly agentId: RdvAgentId
  readonly utilisateurId: UtilisateurCoopId
  /** Cache local des organisations de l'agent : peut être en retard sur l'API. */
  readonly organisationIds: readonly OrganisationId[]
  /** Organisations pour lesquelles la pose du webhook a échoué — synchro par polling. */
  readonly organisationIdsSansWebhook: readonly OrganisationId[]
  readonly synchroniserDepuis: Date | null
  readonly derniereSynchro: Date | null
  readonly inclureRdvsDansActivites: boolean
}

/** Compte créé côté La Coop, mais dont le parcours OAuth n'a jamais abouti. */
export type CompteRdvNonLie = CompteRdvBase & {
  readonly _tag: 'nonLie'
}

/** Compte opérationnel : les appels API partent avec ces jetons. */
export type CompteRdvLie = CompteRdvBase & {
  readonly _tag: 'lie'
  readonly jetons: JetonsOAuth
}

/**
 * Le dernier échange avec RDV Service Public a échoué (jeton révoqué, API
 * injoignable). Les jetons sont conservés : l'erreur peut être transitoire, et
 * une reconnexion OAuth n'a rien de destructif.
 */
export type CompteRdvEnErreur = CompteRdvBase & {
  readonly _tag: 'enErreur'
  readonly jetons: JetonsOAuth
  readonly erreur: MessageErreurCompte
}

/** L'utilisateur a délié son compte : les jetons ont été purgés. */
export type CompteRdvDeconnecte = CompteRdvBase & {
  readonly _tag: 'deconnecte'
  readonly deconnexion: Date
}

/**
 * L'état d'un compte RDV était jusqu'ici encodé par cinq colonnes
 * (`access_token`, `refresh_token`, `expires_at`, `deleted`, `error`) que chaque
 * appelant recombinait à sa façon — d'où un widget d'accueil entièrement masqué
 * dès qu'`error` était posé, alors que la page activités affichait les mêmes
 * rendez-vous. L'union rend les quatre états mutuellement exclusifs et force
 * l'appelant à traiter celui qui l'intéresse (DM-5).
 */
export type CompteRdv =
  | CompteRdvNonLie
  | CompteRdvLie
  | CompteRdvEnErreur
  | CompteRdvDeconnecte

/**
 * Compte disposant de jetons, donc éligible à un appel API. Un compte en erreur
 * en fait partie : c'est précisément en réessayant qu'on sort de l'erreur.
 */
export type CompteRdvUtilisable = CompteRdvLie | CompteRdvEnErreur

export const estUtilisable = (
  compte: CompteRdv,
): compte is CompteRdvUtilisable =>
  compte._tag === 'lie' || compte._tag === 'enErreur'
