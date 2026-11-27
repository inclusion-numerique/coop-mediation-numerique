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
import { toBeneficiaireRow } from './ligne-du-beneficiaire.presenter'

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

describe('toBeneficiaireRow', () => {
  it('builds the detail href and accessibility label', () => {
    const row = toBeneficiaireRow(
      beneficiaireListItem({ index: 7, prenom: 'Ada', nom: 'Lovelace' }),
    )
    expect(row.href).toBe(
      '/coop/mes-beneficiaires/00000000-0000-0000-0000-000000000007',
    )
    expect(row.label).toBe('Ada Lovelace')
  })

  it('renders a dash when the birth year is absent', () => {
    expect(
      toBeneficiaireRow(beneficiaireListItem({ anneeNaissance: null }))
        .anneeNaissance,
    ).toBe('-')
  })

  it('formats the birth year and keeps the accompaniments count', () => {
    const row = toBeneficiaireRow(
      beneficiaireListItem({
        anneeNaissance: 1990,
        accompagnementsCount: 5,
      }),
    )
    expect(row.anneeNaissance).toBe('1990')
    expect(row.accompagnementsCount).toBe('5')
  })
})
