import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { proprietairePartageDe } from './proprietaire-partage'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

describe('proprietairePartageDe', () => {
  it('désigne le médiateur', () => {
    expect(
      proprietairePartageDe({ mediateurId: MEDIATEUR, coordinateurId: null }),
    ).toEqual({ _tag: 'Mediateur', mediateurId: MEDIATEUR })
  })

  it('désigne le coordinateur', () => {
    expect(
      proprietairePartageDe({
        mediateurId: null,
        coordinateurId: COORDINATEUR,
      }),
    ).toEqual({ _tag: 'Coordinateur', coordinateurId: COORDINATEUR })
  })

  it('fait passer le médiateur avant le coordinateur', () => {
    expect(
      proprietairePartageDe({
        mediateurId: MEDIATEUR,
        coordinateurId: COORDINATEUR,
      }),
    ).toEqual({ _tag: 'Mediateur', mediateurId: MEDIATEUR })
  })

  it('ne désigne personne pour un compte sans rôle', () => {
    expect(
      proprietairePartageDe({ mediateurId: null, coordinateurId: null }),
    ).toBeNull()
  })
})
