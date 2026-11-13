import { departementDuCode } from '@app/web/libraries/departement'
import { Commune, LieuActiviteId, NomDeStructure } from '../../../domain'
import type { LieuDesStatistiques } from '../domain'
import { optionsDesLieuxChoisis } from './options-de-lieux.presenter'

const rhone = departementDuCode('69')

const lieux: readonly LieuDesStatistiques[] = [
  {
    genre: 'LieuDActivite',
    id: LieuActiviteId('0b1f2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
    nom: NomDeStructure('Médiathèque'),
  },
  {
    genre: 'Commune',
    commune: Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69381' }),
  },
  ...(rhone.success
    ? [{ genre: 'Departement' as const, departement: rhone.data }]
    : []),
]

describe('options des lieux choisis', () => {
  it('libelle chaque lieu comme la barre de filtres', () => {
    expect(optionsDesLieuxChoisis(lieux)).toEqual({
      lieuxActiviteOptions: [
        {
          value: '0b1f2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
          label: 'Médiathèque',
        },
      ],
      communesOptions: [{ value: '69381', label: 'Lyon · 69001' }],
      departementsOptions: [{ value: '69', label: '69 · Rhône' }],
    })
  })
})
