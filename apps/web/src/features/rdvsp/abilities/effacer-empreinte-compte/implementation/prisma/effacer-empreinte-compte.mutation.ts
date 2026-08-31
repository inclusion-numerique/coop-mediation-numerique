import { prismaClient } from '@app/web/prismaClient'

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
export const effacerEmpreinteCompte = async ({
  utilisateurId,
}: {
  readonly utilisateurId: string
}): Promise<{
  readonly compteDelie: boolean
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}> => {
  const compte = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    select: { id: true },
  })

  if (compte === null)
    return { compteDelie: false, rdvsExpurges: 0, usagersSupprimes: 0 }

  const rdvs = await prismaClient.rdv.findMany({
    where: { rdvAccountId: compte.id },
    select: { id: true },
  })

  const rdvIds = rdvs.map(({ id }) => id)

  // Les usagers touchés sont relevés AVANT la suppression : les participations
  // qui les désignent disparaissent en cascade avec les rendez-vous.
  const participations = await prismaClient.rdvParticipation.findMany({
    where: { rdvId: { in: rdvIds } },
    select: { userId: true },
  })

  const usagersTouches = [
    ...new Set(participations.map(({ userId }) => userId)),
  ]

  await prismaClient.$transaction([
    prismaClient.rdv.deleteMany({ where: { rdvAccountId: compte.id } }),
    prismaClient.rdvSyncLog.deleteMany({ where: { rdvAccountId: compte.id } }),
    prismaClient.rdvAccountOrganisation.deleteMany({
      where: { accountId: compte.id },
    }),
    prismaClient.rdvAccount.delete({ where: { id: compte.id } }),
  ])

  const orphelins = await prismaClient.rdvUser.findMany({
    where: {
      id: { in: usagersTouches },
      participations: { none: {} },
      beneficiaires: { none: {} },
      userProfiles: { none: {} },
      dependents: { none: {} },
    },
    select: { id: true },
  })

  const { count } = await prismaClient.rdvUser.deleteMany({
    where: { id: { in: orphelins.map(({ id }) => id) } },
  })

  return {
    compteDelie: true,
    rdvsExpurges: rdvIds.length,
    usagersSupprimes: count,
  }
}
