import { describe, expect, it } from 'vitest'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { donneesDeLaDestinationEnBase } from './donnees-de-la-destination.transfer'

describe('données de la destination écrites en base', () => {
  it('éclate la commune de résidence en colonnes', () => {
    expect(
      donneesDeLaDestinationEnBase({
        genre: Genre('Feminin'),
        communeResidence: CommuneResidence({
          commune: 'Lyon',
          codePostal: '69002',
          codeInsee: '69382',
        }),
      }),
    ).toEqual({
      genre: 'Feminin',
      commune: 'Lyon',
      communeCodePostal: '69002',
      communeCodeInsee: '69382',
    })
  })

  it('n’écrit aucune colonne de commune sans commune fusionnée', () => {
    expect(donneesDeLaDestinationEnBase({ genre: Genre('Feminin') })).toEqual({
      genre: 'Feminin',
    })
  })
})
