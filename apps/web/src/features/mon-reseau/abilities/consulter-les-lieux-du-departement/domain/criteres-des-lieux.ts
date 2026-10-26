import type { CodeInsee } from '@app/web/libraries/departement'
import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import {
  communesLues,
  LignesParPage,
  NumeroDePage,
  premiereValeur,
  Recherche,
  type ValeurDeParametre,
} from '../../../domain'

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

export type ParametresDesLieux = {
  readonly recherche?: ValeurDeParametre
  readonly communes?: ValeurDeParametre
  readonly tri?: ValeurDeParametre
  readonly page?: ValeurDeParametre
  readonly lignes?: ValeurDeParametre
}

export const criteresDesLieux = ({
  recherche,
  communes,
  tri,
  page,
  lignes,
}: ParametresDesLieux): CriteresDesLieux => ({
  recherche: Recherche.safe(premiereValeur(recherche) ?? ''),
  communes: communesLues(communes),
  tri: TriDesLieuxAffiche(premiereValeur(tri)),
  page: NumeroDePage(premiereValeur(page)),
  lignes: LignesParPage(premiereValeur(lignes)),
})

export const estFiltre = ({ recherche, communes }: CriteresDesLieux): boolean =>
  recherche !== null || communes.length > 0
