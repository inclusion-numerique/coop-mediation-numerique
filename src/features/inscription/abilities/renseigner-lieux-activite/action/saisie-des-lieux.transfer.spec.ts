import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { AdresseNonValidee } from '../domain'
import type { RenseignerLieuxActiviteData } from './renseigner-lieux-activite.validation'
import { depuisLaSaisie } from './saisie-des-lieux.transfer'

type LieuSoumis = RenseignerLieuxActiviteData['lieux'][number]

const connu: LieuSoumis = {
  id: '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
  structureCartographieNationaleId: 'carto-42',
  nom: 'Médiathèque de Reims',
  siret: null,
  adresse: '2 rue des Fusiliers',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: null,
  banId: null,
  latitude: null,
  longitude: null,
}

const nouveau: LieuSoumis = {
  id: null,
  structureCartographieNationaleId: null,
  nom: 'Maison France Services',
  siret: '55217862900135',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  banId: '51454_0018_00012',
  latitude: 49.25,
  longitude: 4.03,
}

describe('les lieux saisis deviennent des lieux désirés', () => {
  it('rattache tel quel un lieu connu, même sans adresse géocodée', () => {
    expect(depuisLaSaisie([connu])).toEqual(
      success([
        {
          id: '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
          nom: 'Médiathèque de Reims',
          siret: null,
          structureCartographieNationaleId: 'carto-42',
          adresse: '2 rue des Fusiliers',
          commune: 'Reims',
          codePostal: '51100',
          codeInsee: null,
        },
      ]),
    )
  })

  it('crée un nouveau lieu dont l’adresse a été géocodée', () => {
    expect(depuisLaSaisie([nouveau])).toEqual(
      success([
        {
          nom: 'Maison France Services',
          siret: '55217862900135',
          structureCartographieNationaleId: null,
          adresse: '12 rue de la Paix',
          commune: 'Reims',
          codePostal: '51100',
          codeInsee: '51454',
          banId: '51454_0018_00012',
          latitude: 49.25,
          longitude: 4.03,
        },
      ]),
    )
  })

  it.each([
    ['sans code INSEE', { codeInsee: null }],
    ['sans identifiant BAN', { banId: null }],
    ['sans latitude', { latitude: null }],
    ['sans longitude', { longitude: undefined }],
  ])('refuse de créer un lieu %s', (_, manque) => {
    expect(depuisLaSaisie([connu, { ...nouveau, ...manque }])).toEqual(
      failure(AdresseNonValidee('Maison France Services')),
    )
  })

  it('signale le premier lieu refusé', () => {
    expect(
      depuisLaSaisie([
        { ...nouveau, nom: 'Premier', banId: null },
        { ...nouveau, nom: 'Second', banId: null },
      ]),
    ).toEqual(failure(AdresseNonValidee('Premier')))
  })
})
