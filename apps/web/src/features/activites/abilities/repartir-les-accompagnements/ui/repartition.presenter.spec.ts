import {
  Effectif,
  repartitionComplete,
  thematiquesRecherchees,
  typesDActivite,
  typesDeLieu,
} from '../../../domain'
import { materielsComptes, tranchesDeDuree } from '../domain'
import { repartitionPresentee } from './repartition.presenter'

const repartition = repartitionPresentee({
  total: Effectif(4),
  types: repartitionComplete(typesDActivite, [1, 3]),
  durees: repartitionComplete(tranchesDeDuree, [1, 0, 3, 0]),
  typesDeLieu: repartitionComplete(typesDeLieu, []),
  thematiques: repartitionComplete(
    thematiquesRecherchees,
    thematiquesRecherchees.map((thematique) =>
      thematique === 'Email' || thematique === 'SocialSante' ? 2 : 0,
    ),
  ),
  materiels: repartitionComplete(materielsComptes, [0, 0, 0, 0, 4]),
})

describe('répartition présentée', () => {
  it('libelle les types et calcule leur part', () => {
    expect(repartition.typeActivites).toEqual([
      {
        value: 'Individuel',
        label: 'Accompagnement individuel',
        count: 1,
        proportion: 25,
      },
      {
        value: 'Collectif',
        label: 'Atelier collectif',
        count: 3,
        proportion: 75,
      },
    ])
  })

  it('reprend les clés de tranches de durée de l’affichage', () => {
    expect(repartition.durees.map(({ value }) => value)).toEqual([
      '30',
      '60',
      '120',
      'more',
    ])
  })

  it('sépare les thématiques de médiation des démarches administratives', () => {
    expect(
      repartition.thematiques.find(({ value }) => value === 'Email')
        ?.proportion,
    ).toBe(100)
    expect(
      repartition.thematiquesDemarches.find(
        ({ value }) => value === 'SocialSante',
      )?.proportion,
    ).toBe(100)
  })

  it('compte « Pas de matériel »', () => {
    expect(repartition.materiels.at(-1)).toEqual({
      value: 'Aucun',
      label: 'Pas de matériel',
      count: 4,
      proportion: 100,
    })
  })
})
