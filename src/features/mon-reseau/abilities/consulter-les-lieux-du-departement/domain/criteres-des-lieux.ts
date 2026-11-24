import { z } from 'zod'
import type { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import type { LignesParPage, NumeroDePage, Recherche } from '../../../domain'

export const TriDesLieuxAffiche = defineModel(
  z
    .unknown()
    .pipe(z.enum(['nomaz', 'nomza', 'majrecent', 'majancien']).catch('nomaz'))
    .brand('TriDesLieuxAffiche'),
)

export type TriDesLieuxAffiche = Model.TypeOf<typeof TriDesLieuxAffiche>

export type CriteresDesLieux = {
  readonly recherche: Recherche | null
  readonly communes: readonly CodeInsee[]
  readonly tri: TriDesLieuxAffiche
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

export const estFiltre = ({ recherche, communes }: CriteresDesLieux): boolean =>
  recherche !== null || communes.length > 0
