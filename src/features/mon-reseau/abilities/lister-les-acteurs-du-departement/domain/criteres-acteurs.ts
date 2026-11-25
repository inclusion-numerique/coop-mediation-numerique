import type { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { z } from 'zod'
import type { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'

export const filtresDeRole = [
  'conseiller_numerique',
  'mediateur_numerique',
  'coordinateur',
] as const

export const FiltreRole = defineModel(z.enum(filtresDeRole).brand('FiltreRole'))

export type FiltreRole = Model.TypeOf<typeof FiltreRole>

type ColonneDesActeurs = 'nom'

export type CriteresActeurs = {
  readonly recherche: Search
  readonly role: FiltreRole | null
  readonly communes: readonly CodeInsee[]
  readonly tri: Sort<ColonneDesActeurs>
  readonly page: Page
  readonly pageSize: PageSize
}

export const estFiltre = ({ recherche, role, communes }: CriteresActeurs) =>
  recherche !== '' || role !== null || communes.length > 0
