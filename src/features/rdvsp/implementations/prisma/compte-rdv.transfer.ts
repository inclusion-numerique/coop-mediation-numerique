import type { RdvAccount } from '@/generated/prisma/client'
import {
  type CompteRdv,
  MessageErreurCompte,
} from '../../domain/compte/compte-rdv'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
  PorteeOAuth,
} from '../../domain/compte/jetons-oauth'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../domain/identifiants/utilisateur-coop-id'
import { absentSiVide } from './vide.transfer'

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

export const jetonsCompteToDomain = (
  row: Pick<
    CompteRdvRow,
    'accessToken' | 'refreshToken' | 'expiresAt' | 'scope'
  >,
): JetonsOAuth | null => {
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

export const compteRdvToDomain = (row: CompteRdvRow): CompteRdv => {
  const base = toBase(row)

  if (row.deleted !== null) {
    return { ...base, _tag: 'deconnecte', deconnexion: row.deleted }
  }

  const jetons = jetonsCompteToDomain(row)

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
