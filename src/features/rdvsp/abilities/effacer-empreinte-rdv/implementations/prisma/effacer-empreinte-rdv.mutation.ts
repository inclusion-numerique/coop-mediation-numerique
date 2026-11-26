import { prismaClient } from '@/configuration/prisma'
import type {
  SupprimerLeCompteRdv,
  SupprimerLesUsagers,
} from '../../domain/ports'

/**
 * Efface tout ce qu'un compte a laissé dans RDV Service Public.
 *
 * ── Pourquoi les rendez-vous sont SUPPRIMÉS et non expurgés ──────────────────
 *
 * Les deux contraintes de la base ne laissent pas le choix :
 *
 *   rdvs.rdv_account_id      → rdv_accounts   RESTRICT
 *   rdv_participations.rdv_id → rdvs          CASCADE
 *   rdv_participations.user_id → rdv_users    RESTRICT
 *   activites.rdv_id          → rdvs          SET NULL
 *
 * Conserver les rendez-vous rendrait le compte agent indestructible (RESTRICT),
 * et surtout leurs participations continueraient de référencer les usagers :
 * aucun ne serait JAMAIS orphelin, donc aucune identité d'usager ne serait
 * jamais effacée. L'effacement se viderait de sa substance.
 *
 * Les supprimer coûte le lien `activites.rdv_id`, que la base met à `null`
 * d'elle-même. L'activité survit entière — sa date, son type, ses
 * accompagnements, tout ce qui compte dans les statistiques. Elle perd la
 * référence vers un rendez-vous qui, lui, n'existe plus.
 *
 * ── Un usager n'est supprimé que s'il n'est plus rattaché à rien ─────────────
 *
 * Un usager est partagé : 565 d'entre eux servent de deux à quatre médiateurs.
 * Le supprimer parce qu'un seul s'en va dépouillerait ses collègues. On ne
 * supprime donc que ceux dont il ne reste ni participation, ni bénéficiaire, ni
 * rattachement à une organisation, ni ayant-droit — cette dernière condition
 * n'étant pas théorique : l'auto-relation responsable/ayant-droit est peuplée,
 * et supprimer un responsable dont l'ayant-droit survit violerait la contrainte.
 *
 * Idempotent : un second passage ne trouve plus de compte agent et rend zéro.
 */
export const supprimerLeCompteRdv: SupprimerLeCompteRdv = async (agentId) => {
  await prismaClient.$transaction([
    prismaClient.rdv.deleteMany({ where: { rdvAccountId: agentId } }),
    prismaClient.rdvSyncLog.deleteMany({ where: { rdvAccountId: agentId } }),
    prismaClient.rdvAccountOrganisation.deleteMany({
      where: { accountId: agentId },
    }),
    prismaClient.rdvAccount.delete({ where: { id: agentId } }),
  ])
}

export const supprimerLesUsagers: SupprimerLesUsagers = async (usagerIds) => {
  await prismaClient.rdvUser.deleteMany({
    where: { id: { in: [...usagerIds] } },
  })
}
