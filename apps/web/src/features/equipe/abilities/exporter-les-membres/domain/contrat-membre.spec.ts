import { contratEnCours, type LigneContrat } from './contrat-membre'
import { TypeContrat } from './type-contrat'

const maintenant = new Date('2026-06-01T00:00:00Z')

const cdd: LigneContrat = {
  type: TypeContrat('CDD'),
  debut: new Date('2026-01-01T00:00:00Z'),
  fin: new Date('2026-12-31T00:00:00Z'),
  rompuLe: null,
}

describe('contrat en cours d’un membre', () => {
  it('n’existe pas sans contrat', () => {
    expect(contratEnCours([], maintenant)).toBeNull()
  })

  it('retient le contrat le plus récent', () => {
    const ancien = {
      ...cdd,
      type: TypeContrat('PEC'),
      debut: new Date('2024-01-01T00:00:00Z'),
    }

    expect(contratEnCours([ancien, cdd], maintenant)?.type).toBe('CDD')
  })

  it('n’existe plus une fois rompu', () => {
    expect(
      contratEnCours(
        [{ ...cdd, rompuLe: new Date('2026-05-01T00:00:00Z') }],
        maintenant,
      ),
    ).toBeNull()
  })

  it('s’achève à la rupture annoncée si elle précède la fin prévue', () => {
    expect(
      contratEnCours(
        [{ ...cdd, rompuLe: new Date('2026-09-01T00:00:00Z') }],
        maintenant,
      )?.fin,
    ).toEqual(new Date('2026-09-01T00:00:00Z'))
  })

  it('reste sans fin pour un CDI', () => {
    expect(
      contratEnCours(
        [{ ...cdd, type: TypeContrat('CDI'), fin: null }],
        maintenant,
      ),
    ).toEqual({ type: 'CDI', debut: cdd.debut, fin: null })
  })
})
