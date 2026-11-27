import { Page, PageSize, type Paginated } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import type { BeneficiaireListItem } from '@/features/beneficiaire/abilities/lister-beneficiaires/domain/liste-des-beneficiaires'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { presentMesBeneficiaires } from './lister-beneficiaires.presenter'

const baseId = '00000000-0000-0000-0000-0000000000'

const beneficiaireListItem = (
  overrides: Partial<{
    index: number
    prenom: string
    nom: string
    anneeNaissance: number | null
    accompagnementsCount: number
  }> = {},
): BeneficiaireListItem => {
  const index = overrides.index ?? 1
  return {
    id: BeneficiaireId(`${baseId}${index.toString().padStart(2, '0')}`),
    mediateurId: MediateurId('00000000-0000-0000-0000-0000000000aa'),
    prenom: Prenom(overrides.prenom ?? 'Jean'),
    nom: Nom(overrides.nom ?? 'Dupont'),
    telephone: null,
    email: null,
    anneeNaissance:
      overrides.anneeNaissance === null
        ? null
        : AnneeNaissance(new Date('2026-06-15T12:00:00.000Z'))(
            overrides.anneeNaissance ?? 1990,
          ),
    trancheAge: TrancheAge(null),
    genre: Genre(null),
    statutSocial: StatutSocial(null),
    communeResidence: null,
    creation: new Date('2024-01-01T00:00:00.000Z'),
    accompagnementsCount: overrides.accompagnementsCount ?? 0,
    notes: null,
  }
}

const paginated = (
  items: BeneficiaireListItem[],
  totalItems: number,
  page = 1,
  pageSize = 20,
): Paginated<BeneficiaireListItem> => ({
  items,
  totalItems,
  currentPage: Page(page),
  pageSize: PageSize(pageSize),
})

describe('presentMesBeneficiaires', () => {
  it('is empty when there is nothing and no search', () => {
    expect(presentMesBeneficiaires(paginated([], 0))).toEqual({ tag: 'empty' })
  })

  it('is noResults when a search yields nothing', () => {
    expect(presentMesBeneficiaires(paginated([], 0), 'jean')).toEqual({
      tag: 'noResults',
      recherche: 'jean',
    })
  })

  it('projects items to flat rows', () => {
    const view = presentMesBeneficiaires(
      paginated([beneficiaireListItem({ prenom: 'Ada', nom: 'Lovelace' })], 1),
    )
    expect(view.tag).toBe('results')
    if (view.tag !== 'results') return
    expect(view.rows[0]).toMatchObject({
      prenom: 'Ada',
      nom: 'Lovelace',
      label: 'Ada Lovelace',
    })
  })

  it('computes pagination metadata', () => {
    const view = presentMesBeneficiaires(
      paginated([beneficiaireListItem()], 45, 2, 20),
    )
    if (view.tag !== 'results') throw new Error('expected results')
    expect(view.pagination).toEqual({
      currentPage: 2,
      pageSize: 20,
      totalItems: 45,
      totalPages: 3,
      hasMultiplePages: true,
    })
  })
})
