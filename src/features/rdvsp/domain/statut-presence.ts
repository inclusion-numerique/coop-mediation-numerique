import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const statutsPresence = [
  'unknown',
  'seen',
  'excused',
  'revoked',
  'noshow',
] as const

/**
 * Statut de présence tel que RDV Service Public le définit, repris tel quel :
 * les valeurs sont celles de leur API et de notre enum Postgres
 * `rdv_attendance_status`. `unknown` ne signifie pas « inconnu » mais « pas
 * encore renseigné » — voir `StatutRdv` pour le statut réellement affiché.
 */
export const StatutPresence = defineModel(
  z.enum(statutsPresence).brand('StatutPresence'),
)

export type StatutPresence = Model.TypeOf<typeof StatutPresence>

export const statutsPresenceModifiables = [
  'seen',
  'excused',
  'revoked',
  'noshow',
] as const

/**
 * Sous-ensemble des statuts qu'un agent peut poser lui-même : on ne peut pas
 * repasser un rendez-vous à `unknown` via l'API.
 */
export const StatutPresenceModifiable = defineModel(
  z.enum(statutsPresenceModifiables).brand('StatutPresenceModifiable'),
)

export type StatutPresenceModifiable = Model.TypeOf<
  typeof StatutPresenceModifiable
>
