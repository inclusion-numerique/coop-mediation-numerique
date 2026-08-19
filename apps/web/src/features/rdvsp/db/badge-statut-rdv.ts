import { StatutPresence } from '../domain/statut-presence'
import { statutRdv } from '../domain/statut-rdv'

/**
 * Statut affiché d'un rendez-vous, dans le vocabulaire de la feature activités.
 *
 * La décision — un rendez-vous échu dont la présence n'a pas été saisie est
 * « passé » — vient du domaine, où elle n'a qu'une définition. Seul le mot change
 * ici : les activités disent `past`, y compris dans leurs URLs de filtre, et ce
 * vocabulaire leur appartient. La traduction se fait donc à la frontière, pas en
 * propageant l'un des deux termes chez l'autre.
 */
export type BadgeStatutRdv =
  | 'unknown'
  | 'past'
  | 'seen'
  | 'revoked'
  | 'excused'
  | 'noshow'

export const addRdvBadgeStatus = <
  T extends {
    endsAt: Date
    status: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  },
>(
  rdv: T,
): T & { badgeStatus: BadgeStatutRdv } => {
  const statut = statutRdv(StatutPresence(rdv.status), rdv.endsAt, new Date())

  return { ...rdv, badgeStatus: statut === 'passe' ? 'past' : statut }
}
