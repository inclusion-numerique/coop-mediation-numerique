import { MediateurId } from '../../../domain/mediateur-id'
import { doitEtrePrevenu, peutRetirer, quiRetire } from './qui-retire'

const marc = MediateurId('550e8400-e29b-41d4-a716-446655440021')
const alex = MediateurId('550e8400-e29b-41d4-a716-446655440022')

const auteur = (options: Partial<Parameters<typeof quiRetire>[0]> = {}) =>
  quiRetire({
    mediateurRetire: marc,
    mediateurDeLAuteur: null,
    estAdministrateur: false,
    estCoordinateur: false,
    ...options,
  })

describe('qui peut retirer un médiateur d’un lieu', () => {
  it('le médiateur lui-même', () => {
    const lui = auteur({ mediateurDeLAuteur: marc })

    expect(peutRetirer(lui)).toBe(true)
    expect(doitEtrePrevenu(lui)).toBe(false)
  })

  it('un coordinateur, qui prévient alors l’intéressé', () => {
    const coordinateur = auteur({ estCoordinateur: true })

    expect(peutRetirer(coordinateur)).toBe(true)
    expect(doitEtrePrevenu(coordinateur)).toBe(true)
  })

  it('un administrateur', () => {
    expect(peutRetirer(auteur({ estAdministrateur: true }))).toBe(true)
  })

  it('mais pas un médiateur tiers', () => {
    expect(peutRetirer(auteur({ mediateurDeLAuteur: alex }))).toBe(false)
  })

  it('ni quelqu’un sans aucun de ces titres', () => {
    expect(peutRetirer(auteur())).toBe(false)
  })
})
