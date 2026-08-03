import { contratPourEmployeuse } from './contrat'

const ligne = (structureId: number | null, dateDebut: Date | null) => ({
  structureId,
  dateDebut,
})

describe('contratPourEmployeuse', () => {
  it('retient le contrat de l’employeuse au début le plus récent', () => {
    const contrat = contratPourEmployeuse(
      [
        ligne(1, new Date('2024-01-01')),
        ligne(1, new Date('2026-01-01')),
        ligne(2, new Date('2027-01-01')),
      ],
      1,
    )
    expect(contrat?.dateDebut).toEqual(new Date('2026-01-01'))
  })

  it('ne rend rien quand aucun contrat ne vise l’employeuse', () => {
    expect(contratPourEmployeuse([ligne(2, new Date())], 1)).toBeNull()
  })

  it('ignore les contrats sans structure — ils ne sont rattachables à personne', () => {
    expect(contratPourEmployeuse([ligne(null, new Date())], 1)).toBeNull()
  })
})
