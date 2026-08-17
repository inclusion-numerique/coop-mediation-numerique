import type { RdvAccount } from '@prisma/client'
import { type CompteRdv, MessageErreurCompte } from '../domain/compte-rdv'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
  PorteeOAuth,
} from '../domain/jetons-oauth'
import { OrganisationId } from '../domain/organisation-id'
import { RdvAgentId } from '../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../domain/utilisateur-coop-id'
import { absentSiVide } from './vide'

/**
 * Les organisations d'un compte vivent dans une table de jointure : la lecture
 * doit les inclure, l'écriture les traite à part (voir `compteRdvFromDomain`).
 *
 * Les colonnes sont énumérées plutôt que reprises en bloc : la lecture déclare
 * ainsi ce dont elle a besoin, et une sélection partielle — celle de la session,
 * qui ne charge pas tout `rdv_accounts` — la satisfait.
 */
export type CompteRdvRow = Pick<
  RdvAccount,
  | 'id'
  | 'userId'
  | 'accessToken'
  | 'refreshToken'
  | 'expiresAt'
  | 'scope'
  | 'error'
  | 'deleted'
  | 'syncFrom'
  | 'lastSynced'
  | 'includeRdvsInActivitesList'
  | 'invalidWebhookOrganisationIds'
> & {
  organisations: readonly { organisationId: number }[]
}

const toBase = (row: CompteRdvRow) => ({
  agentId: RdvAgentId(row.id),
  utilisateurId: UtilisateurCoopId(row.userId),
  organisationIds: row.organisations.map(({ organisationId }) =>
    OrganisationId(organisationId),
  ),
  organisationIdsSansWebhook: row.invalidWebhookOrganisationIds.map(
    (organisationId) => OrganisationId(organisationId),
  ),
  synchroniserDepuis: row.syncFrom,
  derniereSynchro: row.lastSynced,
  inclureRdvsDansActivites: row.includeRdvsInActivitesList,
})

const toJetons = (row: CompteRdvRow): JetonsOAuth | null => {
  const acces = absentSiVide(row.accessToken)
  const rafraichissement = absentSiVide(row.refreshToken)
  const portee = absentSiVide(row.scope)

  return acces === null
    ? null
    : {
        acces: JetonAcces(acces),
        rafraichissement:
          rafraichissement === null
            ? null
            : JetonRafraichissement(rafraichissement),
        expiration: row.expiresAt,
        portee: portee === null ? null : PorteeOAuth(portee),
      }
}

/**
 * Ordre de lecture des quatre états : la déconnexion prime — elle purge les
 * jetons et rend toute erreur antérieure sans objet — puis l'absence de jeton,
 * puis l'erreur. Un compte qui porte des jetons et aucune erreur est lié.
 */
export const compteRdvToDomain = (row: CompteRdvRow): CompteRdv => {
  const base = toBase(row)

  if (row.deleted !== null) {
    return { ...base, _tag: 'deconnecte', deconnexion: row.deleted }
  }

  const jetons = toJetons(row)

  if (jetons === null) {
    return { ...base, _tag: 'nonLie' }
  }

  const erreur = absentSiVide(row.error)

  return erreur === null
    ? { ...base, _tag: 'lie', jetons }
    : { ...base, _tag: 'enErreur', jetons, erreur: MessageErreurCompte(erreur) }
}

const jetonsFromDomain = (compte: CompteRdv) =>
  compte._tag === 'lie' || compte._tag === 'enErreur'
    ? {
        accessToken: compte.jetons.acces,
        refreshToken: compte.jetons.rafraichissement,
        expiresAt: compte.jetons.expiration,
        scope: compte.jetons.portee,
      }
    : { accessToken: null, refreshToken: null, expiresAt: null, scope: null }

/**
 * Rend les seules colonnes scalaires de `rdv_accounts`. Les organisations sont
 * une relation : l'appelant les écrit par un `connect`/`set` imbriqué à partir
 * de `compte.organisationIds`. `metadata` n'est pas géré ici — c'est un cache
 * brut du payload agent, conservé tel quel en base et hors du domaine.
 */
export const compteRdvFromDomain = (compte: CompteRdv) => ({
  id: compte.agentId,
  userId: compte.utilisateurId,
  invalidWebhookOrganisationIds: [...compte.organisationIdsSansWebhook],
  syncFrom: compte.synchroniserDepuis,
  lastSynced: compte.derniereSynchro,
  includeRdvsInActivitesList: compte.inclureRdvsDansActivites,
  deleted: compte._tag === 'deconnecte' ? compte.deconnexion : null,
  error: compte._tag === 'enErreur' ? compte.erreur : null,
  ...jetonsFromDomain(compte),
})
