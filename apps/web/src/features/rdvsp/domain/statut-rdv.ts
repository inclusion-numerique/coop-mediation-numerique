import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { type StatutPresence, statutsPresence } from './statut-presence'

export const statutsRdv = [...statutsPresence, 'passe'] as const

/**
 * Statut réellement affiché à l'utilisateur. RDV Service Public ne distingue pas
 * un rendez-vous à venir d'un rendez-vous échu dont personne n'a saisi la
 * présence : les deux valent `unknown`. La Coop ajoute donc `passe`.
 */
export const StatutRdv = defineModel(z.enum(statutsRdv).brand('StatutRdv'))

export type StatutRdv = Model.TypeOf<typeof StatutRdv>

/**
 * Dérive le statut affiché du statut de présence et de l'heure de fin.
 *
 * Le calcul se fait à la lecture, jamais à l'écriture : figer `passe` en base
 * produirait un instantané qui se périme, et un rendez-vous honoré après coup
 * resterait affiché « passé ». `maintenant` est un paramètre pour que la règle
 * reste pure et testable — la date courante est fournie par l'appelant.
 */
export const statutRdv = (
  statutPresence: StatutPresence,
  fin: Date,
  maintenant: Date,
): StatutRdv =>
  statutPresence === 'unknown' && fin.getTime() <= maintenant.getTime()
    ? StatutRdv('passe')
    : StatutRdv(statutPresence)
