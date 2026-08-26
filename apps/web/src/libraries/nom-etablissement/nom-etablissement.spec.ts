import {
  libelleSansIdentite,
  nomsCorrespondent,
  normaliserNom,
} from './nom-etablissement'

describe('normaliserNom', () => {
  it('efface casse, accents et ponctuation', () => {
    expect(normaliserNom('MAIRIE DU PRÊCHEUR')).toBe('ville precheur')
  })

  it('ramène les préfixes administratifs équivalents au même jeton', () => {
    expect(normaliserNom('Commune du Precheur')).toBe(
      normaliserNom('Ville du Prêcheur'),
    )
  })
})

describe('nomsCorrespondent', () => {
  it.each([
    ['MAIRIE DU PRÊCHEUR', 'COMMUNE DU PRECHEUR'],
    ['Mairie de Fleury', 'COMMUNE DE FLEURY'],
    ['Ville de Boult', 'Boult'],
  ])('reconnaît « %s » et « %s » comme le même établissement', (un, autre) => {
    expect(nomsCorrespondent(un, autre)).toBe(true)
  })

  it('distingue un service de l’entité qui l’héberge', () => {
    expect(nomsCorrespondent('EPN de Fleury', 'Commune de Fleury')).toBe(false)
  })

  it('distingue deux services différents de la même entité', () => {
    expect(nomsCorrespondent('Médiathèque de Fleury', 'MJC de Fleury')).toBe(
      false,
    )
  })

  it('ne fait correspondre personne à un nom qui ne laisse rien', () => {
    expect(nomsCorrespondent('- - -', 'Mairie de Fleury')).toBe(false)
  })

  /**
   * Limite connue, héritée de l'algorithme des imports : les mots de liaison ne
   * sont ramenés qu'en tête de nom (par les préfixes équivalents), pas au
   * milieu — « … de Salles » et « … Salles » ne se contiennent donc pas.
   */
  it('ne rapproche pas deux noms qui ne diffèrent que par un mot de liaison interne', () => {
    expect(
      nomsCorrespondent(
        'Maison France Services de Salles',
        'Maison France Services Salles',
      ),
    ).toBe(false)
  })

  it('ne rapproche pas deux communes distinctes', () => {
    expect(nomsCorrespondent('Mairie de Boult', 'Mairie de Raze')).toBe(false)
  })
})

describe('libelleSansIdentite', () => {
  it.each([
    '',
    '   ',
    '[Non diffusible]',
    '[NON-DIFFUSIBLE]',
    'Non communiqué',
  ])('reconnaît « %s » comme ne désignant personne', (libelle) => {
    expect(libelleSansIdentite(libelle)).toBe(true)
  })

  it('ne confond pas un vrai nom avec un marqueur d’absence', () => {
    expect(libelleSansIdentite('Mairie de Fleury')).toBe(false)
  })

  it('ne rapproche jamais deux établissements non diffusibles', () => {
    expect(nomsCorrespondent('[Non diffusible]', '[Non diffusible]')).toBe(
      false,
    )
  })
})
