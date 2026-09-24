import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { lienAReprendre } from './reprise-des-liens'

const fiche = (ficheAccesLibre: string | null) =>
  lienAReprendre('ficheAccesLibre')(lieuAReprendre({ ficheAccesLibre }))

const rdv = (priseRdv: string | null) =>
  lienAReprendre('priseRdv')(lieuAReprendre({ priseRdv }))

describe('les liens de la fiche, mesurés au standard', () => {
  it('ne concerne pas un lieu sans lien', () => {
    expect(rdv(null)).toBeNull()
  })

  it('laisse en place une prise de rendez-vous valide', () => {
    expect(rdv('https://rdv.anct.gouv.fr/')).toBeNull()
  })

  it('laisse en place une fiche Accès Libre valide', () => {
    expect(
      fiche('https://acceslibre.beta.gouv.fr/app/erp/mediatheque'),
    ).toBeNull()
  })

  it.each([
    ['une chaîne vide', ''],
    ['du blanc', '  '],
  ])('efface %s', (_cas, valeur) => {
    expect(rdv(valeur)).toEqual({ verdict: 'a-effacer', efface: valeur })
  })

  it('efface une fiche qui ne pointe pas vers Accès Libre', () => {
    expect(fiche('https://www.exemple.fr/accessibilite')).toEqual({
      verdict: 'a-effacer',
      efface: 'https://www.exemple.fr/accessibilite',
    })
  })

  it('corrige une URL que le nettoyage rend valide', () => {
    expect(rdv('rdv.anct.gouv.fr')).toEqual({
      verdict: 'a-corriger',
      corrige: 'http://rdv.anct.gouv.fr',
    })
  })
})
