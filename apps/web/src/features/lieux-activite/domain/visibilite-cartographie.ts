import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const visibilitesCartographie = ['Publie', 'NonPublie'] as const

/**
 * La publication du lieu sur la cartographie nationale. La colonne est un
 * booléen, mais « visible » ne dit pas de quoi il s'agit : ce qui se décide
 * ici, c'est la diffusion de la fiche hors de la coop.
 */
export const VisibiliteCartographie = defineModel(
  z.enum(visibilitesCartographie).brand('VisibiliteCartographie'),
)

export type VisibiliteCartographie = Model.TypeOf<typeof VisibiliteCartographie>

export const estPublie = (visibilite: VisibiliteCartographie): boolean =>
  visibilite === VisibiliteCartographie('Publie')
