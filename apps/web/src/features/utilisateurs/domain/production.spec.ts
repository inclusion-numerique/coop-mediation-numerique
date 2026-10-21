import {
  aProduit,
  coordinateurEstVierge,
  mediateurEstVierge,
} from './production'
import { rattachements } from './rattachements'

const mediateurVierge = { activites: false, beneficiaires: false }
const coordinateurVierge = {
  equipe: false,
  activitesCoordination: false,
  invitationsEnAttente: false,
}

describe('production d’un compte', () => {
  it.each([
    [{ activites: true, beneficiaires: false }, false],
    [{ activites: false, beneficiaires: true }, false],
    [mediateurVierge, true],
  ])('médiateur %o vierge : %s', (production, vierge) => {
    expect(mediateurEstVierge(production)).toBe(vierge)
  })

  it.each([
    [{ ...coordinateurVierge, equipe: true }, false],
    [{ ...coordinateurVierge, activitesCoordination: true }, false],
    [{ ...coordinateurVierge, invitationsEnAttente: true }, false],
    [coordinateurVierge, true],
  ])('coordinateur %o vierge : %s', (production, vierge) => {
    expect(coordinateurEstVierge(production)).toBe(vierge)
  })

  it('n’a rien produit sans rattachement', () => {
    expect(aProduit({ _tag: 'aucun' })).toBe(false)
  })

  it('a produit dès qu’un de ses rôles a produit', () => {
    expect(
      aProduit(
        rattachements(
          { activites: false, beneficiaires: true },
          coordinateurVierge,
        ),
      ),
    ).toBe(true)
  })

  it('n’a rien produit quand ses deux rôles sont vierges', () => {
    expect(aProduit(rattachements(mediateurVierge, coordinateurVierge))).toBe(
      false,
    )
  })
})
