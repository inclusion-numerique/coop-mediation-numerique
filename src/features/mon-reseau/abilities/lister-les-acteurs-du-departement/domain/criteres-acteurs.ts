import { z } from 'zod'
import type { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import {
  communesLues,
  LignesParPage,
  NumeroDePage,
  premiereValeur,
  Recherche,
  type ValeurDeParametre,
} from '../../../domain'

export const filtresDeRole = [
  'conseiller_numerique',
  'mediateur_numerique',
  'coordinateur',
] as const

export const FiltreRole = defineModel(z.enum(filtresDeRole).brand('FiltreRole'))

export type FiltreRole = Model.TypeOf<typeof FiltreRole>

const TriActeurs = defineModel(
  z
    .unknown()
    .pipe(z.enum(['nomaz', 'nomza']).catch('nomaz'))
    .brand('TriActeurs'),
)

type TriActeurs = Model.TypeOf<typeof TriActeurs>

export type CriteresActeurs = {
  readonly recherche: Recherche | null
  readonly role: FiltreRole | null
  readonly communes: readonly CodeInsee[]
  readonly tri: TriActeurs
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

export type ParametresDesActeurs = {
  readonly recherche?: ValeurDeParametre
  readonly role?: ValeurDeParametre
  readonly communes?: ValeurDeParametre
  readonly tri?: ValeurDeParametre
  readonly page?: ValeurDeParametre
  readonly lignes?: ValeurDeParametre
}

const roleLu = (role: string | undefined): FiltreRole | null => {
  const lu = FiltreRole.schema.safeParse(role)
  return lu.success ? lu.data : null
}

export const criteresActeurs = ({
  recherche,
  role,
  communes,
  tri,
  page,
  lignes,
}: ParametresDesActeurs): CriteresActeurs => ({
  recherche: Recherche.safe(premiereValeur(recherche) ?? ''),
  role: roleLu(premiereValeur(role)),
  communes: communesLues(communes),
  tri: TriActeurs(premiereValeur(tri)),
  page: NumeroDePage(premiereValeur(page)),
  lignes: LignesParPage(premiereValeur(lignes)),
})

export const estFiltre = ({ recherche, role, communes }: CriteresActeurs) =>
  recherche !== null || role !== null || communes.length > 0
