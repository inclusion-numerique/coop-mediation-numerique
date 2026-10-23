import type { CodeInsee } from '@app/web/libraries/departement'
import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import {
  communesLues,
  LignesParPage,
  NumeroDePage,
  Recherche,
} from '../../../domain'

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

export type ParametresDesActeurs = {
  readonly recherche?: string
  readonly role?: string
  readonly communes?: string
  readonly tri?: string
  readonly page?: string
  readonly lignes?: string
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
  recherche: Recherche.safe(recherche ?? ''),
  role: roleLu(role),
  communes: communesLues(communes),
  tri: TriActeurs(tri),
  page: NumeroDePage(page),
  lignes: LignesParPage(lignes),
})

export const estFiltre = ({ recherche, role, communes }: CriteresActeurs) =>
  recherche !== null || role !== null || communes.length > 0
