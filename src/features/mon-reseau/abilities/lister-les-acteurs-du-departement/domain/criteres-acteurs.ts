import { z } from 'zod'
import type { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import type { LignesParPage, NumeroDePage, Recherche } from '../../../domain'

export const filtresDeRole = [
  'conseiller_numerique',
  'mediateur_numerique',
  'coordinateur',
] as const

export const FiltreRole = defineModel(z.enum(filtresDeRole).brand('FiltreRole'))

export type FiltreRole = Model.TypeOf<typeof FiltreRole>

export const TriActeurs = defineModel(
  z
    .unknown()
    .pipe(z.enum(['nomaz', 'nomza']).catch('nomaz'))
    .brand('TriActeurs'),
)

export type TriActeurs = Model.TypeOf<typeof TriActeurs>

export type CriteresActeurs = {
  readonly recherche: Recherche | null
  readonly role: FiltreRole | null
  readonly communes: readonly CodeInsee[]
  readonly tri: TriActeurs
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

export const estFiltre = ({ recherche, role, communes }: CriteresActeurs) =>
  recherche !== null || role !== null || communes.length > 0
