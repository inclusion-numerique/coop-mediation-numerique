import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { sitesWebAReprendre } from './sites-web-a-reprendre'

const verdict = (siteWeb: readonly string[]) =>
  sitesWebAReprendre(lieuAReprendre({ siteWeb }))

describe('le verdict sur les sites web d’un lieu', () => {
  it('ne reproche rien à une adresse que le modèle accepte', () => {
    expect(verdict(['https://www.exemple.fr'])).toBeNull()
  })

  it('ne touche pas à une adresse valide que le nettoyeur voudrait réécrire', () => {
    expect(
      verdict(['https://metz.fr/lieux/lieu-4526.php#:~:text=Mairie%25']),
    ).toBeNull()
  })

  it('perd une adresse qui ne porte aucun domaine', () => {
    expect(verdict(['https://www.'])).toEqual({
      conservees: [],
      perdues: ['https://www.'],
    })
  })

  it('répare un préfixe doublé', () => {
    expect(verdict(['httphttps://cemea-pdll.org/'])).toEqual({
      conservees: ['https://cemea-pdll.org/'],
      perdues: [],
    })
  })

  it('ne fait tomber que l’adresse fautive, pas la liste', () => {
    expect(verdict(['https://www.exemple.fr', 'https://www.'])).toEqual({
      conservees: ['https://www.exemple.fr'],
      perdues: ['https://www.'],
    })
  })
})
