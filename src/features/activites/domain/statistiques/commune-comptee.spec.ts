import { describe, expect, it } from 'vitest'
import { communeComptee } from './commune-comptee'

describe('commune comptée', () => {
  it('est renseignée quand nom, code postal et code INSEE sont valides', () => {
    expect(
      communeComptee({ nom: 'Lyon', codePostal: '69001', codeInsee: '69381' }),
    ).toEqual({
      type: 'Renseignee',
      commune: { nom: 'Lyon', codePostal: '69001', codeInsee: '69381' },
    })
  })

  it.each<{
    readonly nom: string | null
    readonly codePostal: string | null
    readonly codeInsee: string | null
  }>([
    { nom: null, codePostal: null, codeInsee: null },
    { nom: 'Amiens', codePostal: '', codeInsee: '80021' },
    { nom: 'Amiens', codePostal: '8000', codeInsee: '80021' },
  ])(
    'est non communiquée quand elle est incomplète ou invalide (%o)',
    (colonnes) => {
      expect(communeComptee(colonnes)).toEqual({ type: 'NonCommuniquee' })
    },
  )
})
