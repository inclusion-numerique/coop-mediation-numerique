import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Rôle choisi à l'inscription. Orthogonal au statut conseiller numérique (un
 * fait Dataspace porté par un booléen à part) : un conseiller numérique est un
 * médiateur — ou un coordinateur — dans le dispositif, pas un rôle distinct.
 */
export const roles = ['Mediateur', 'Coordinateur'] as const

export const Role = defineModel(z.enum(roles).brand('Role'))

export type Role = Model.TypeOf<typeof Role>
