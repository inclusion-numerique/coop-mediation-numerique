import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { MATERIELS } from '../../../domain'

export const MATERIELS_COMPTES = [...MATERIELS, 'Aucun'] as const

export const MaterielCompte = defineModel(
  z.enum(MATERIELS_COMPTES).brand('MaterielCompte'),
)

export type MaterielCompte = Model.TypeOf<typeof MaterielCompte>

export const materielsComptes: readonly MaterielCompte[] =
  MATERIELS_COMPTES.map(MaterielCompte)
