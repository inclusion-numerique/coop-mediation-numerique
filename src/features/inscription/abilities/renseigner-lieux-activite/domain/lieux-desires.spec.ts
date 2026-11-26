import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { type LieuSoumis, lieuxDesires } from './lieux-desires'

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

const connuSansIdentifiantsSecondaires: LieuSoumis = {
  id: '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
  nom: 'Médiathèque de Reims',
  adresse: '2 rue des Fusiliers',
  commune: 'Reims',
  codePostal: '51100',
}

describe('les lieux soumis deviennent des lieux désirés', () => {
  it('rattache tel quel un lieu connu, même sans adresse géocodée', () => {
    expect(lieuxDesires([connu])).toEqual(
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

  it('ne prête à un lieu connu aucun identifiant qui n’a pas été soumis', () => {
    expect(lieuxDesires([connuSansIdentifiantsSecondaires])).toStrictEqual(
      success([
        {
          id: '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
          nom: 'Médiathèque de Reims',
          adresse: '2 rue des Fusiliers',
          commune: 'Reims',
          codePostal: '51100',
        },
      ]),
    )
  })

  it('crée un nouveau lieu dont l’adresse a été géocodée', () => {
    expect(lieuxDesires([nouveau])).toEqual(
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
})
