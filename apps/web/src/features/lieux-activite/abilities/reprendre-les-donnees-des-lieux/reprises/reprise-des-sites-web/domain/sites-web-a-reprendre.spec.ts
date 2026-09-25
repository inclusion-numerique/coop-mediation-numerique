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
      rienQueLOrdre: false,
    })
  })

  it('ne fait tomber que l’adresse fautive, pas la liste', () => {
    expect(verdict(['https://www.exemple.fr', 'https://www.'])).toEqual({
      conservees: ['https://www.exemple.fr'],
      perdues: ['https://www.'],
      rienQueLOrdre: false,
    })
  })
})

describe('le gabarit « https://www. » écrit autour de la vraie adresse', () => {
  it.each([
    [
      'en tête, collé',
      'httphttps://cemea-pdll.org/',
      'https://cemea-pdll.org/',
    ],
    [
      'coupé en deux',
      'https:/https://www.exemple.fr/une-page/www.',
      'https://www.exemple.fr/une-page',
    ],
    [
      'en queue du chemin',
      'hthttps://www.exemple.fr/une-pagetps://www.',
      'https://www.exemple.fr/une-page',
    ],
    [
      'avec le point en double',
      'https://www..gareoult.fr',
      'https://gareoult.fr',
    ],
    [
      'en tête d’une adresse valide',
      'https://www.https://www.exemple.fr/',
      'https://www.exemple.fr/',
    ],
    [
      'en queue d’une adresse valide',
      'https://exemple.fr/www.',
      'https://exemple.fr',
    ],
  ])('se retire quand il est %s', (_cas, brut, attendu) => {
    expect(verdict([brut])).toEqual({
      conservees: [attendu],
      perdues: [],
      rienQueLOrdre: false,
    })
  })

  it('rend les deux adresses que le séparateur encodé avait collées', () => {
    expect(
      verdict(['https://un.example.fr/%257Chttps://www.deux.fr/']),
    ).toEqual({
      conservees: ['https://un.example.fr/', 'https://www.deux.fr/'],
      perdues: [],
      rienQueLOrdre: false,
    })
  })

  it('ne coupe pas sur un pipe simplement encodé, légitime dans une requête', () => {
    expect(
      verdict([
        'https://eur03.safelinks.protection.outlook.com/?url=http%3A%2F%2Fexemple.fr&data=05%7C01%7Ca.b%40exemple.fr%7C3000',
      ]),
    ).toBeNull()
  })

  it('renonce quand il ne reste aucun domaine', () => {
    expect(verdict(['http://www.'])).toEqual({
      conservees: [],
      perdues: ['http://www.'],
      rienQueLOrdre: false,
    })
  })
})
