import { beneficiaireListItem } from './beneficiaire-list-item.fixture'
import { toBeneficiaireRow } from './beneficiaire-row'

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
