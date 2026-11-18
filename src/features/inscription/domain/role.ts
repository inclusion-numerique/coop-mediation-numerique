import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/**
 * Rôle choisi à l'inscription. Orthogonal au statut conseiller numérique (un
 * fait Dataspace porté par un booléen à part) : un conseiller numérique est un
 * médiateur — ou un coordinateur — dans le dispositif, pas un rôle distinct.
 */
const roles = ['Mediateur', 'Coordinateur'] as const

export const Role = defineModel(z.enum(roles).brand('Role'))

export type Role = Model.TypeOf<typeof Role>
