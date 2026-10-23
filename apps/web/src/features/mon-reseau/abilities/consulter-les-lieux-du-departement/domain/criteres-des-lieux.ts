import type { CodeInsee } from '@app/web/libraries/departement'
import {
  communesLues,
  LignesParPage,
  NumeroDePage,
  Recherche,
} from '../../../domain'

export type CriteresDesLieux = {
  readonly recherche: Recherche | null
  readonly communes: readonly CodeInsee[]
  readonly tri: string | null
  readonly page: NumeroDePage
  readonly lignes: LignesParPage
}

export type ParametresDesLieux = {
  readonly recherche?: string
  readonly communes?: string
  readonly tri?: string
  readonly page?: string
  readonly lignes?: string
}

export const criteresDesLieux = ({
  recherche,
  communes,
  tri,
  page,
  lignes,
}: ParametresDesLieux): CriteresDesLieux => ({
  recherche: Recherche.safe(recherche ?? ''),
  communes: communesLues(communes),
  tri: tri ?? null,
  page: NumeroDePage(page),
  lignes: LignesParPage(lignes),
})

export const estFiltre = ({ recherche, communes }: CriteresDesLieux): boolean =>
  recherche !== null || communes.length > 0
