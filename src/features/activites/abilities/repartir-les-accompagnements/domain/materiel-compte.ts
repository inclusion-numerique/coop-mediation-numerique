import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { MATERIELS } from '../../../domain'

const MATERIELS_COMPTES = [...MATERIELS, 'Aucun'] as const

export const MaterielCompte = defineModel(
  z.enum(MATERIELS_COMPTES).brand('MaterielCompte'),
)

export type MaterielCompte = Model.TypeOf<typeof MaterielCompte>

export const materielsComptes: readonly MaterielCompte[] =
  MATERIELS_COMPTES.map(MaterielCompte)
