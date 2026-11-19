import { describe, expect, it } from 'vitest'
import {
  copieDeLaCoordination,
  departDuPartenariat,
} from './copie-de-la-coordination.presenter'

describe('copie de la coordination', () => {
  it("oublie l'activité d'origine", () => {
    expect(
      copieDeLaCoordination({
        id: 'a0000000-0000-4000-8000-000000000001',
        notes: 'Réunion',
      }),
    ).toStrictEqual({ id: undefined, notes: 'Réunion' })
  })
})

describe('départ du partenariat', () => {
  it('propose une structure partenaire vide', () => {
    expect(departDuPartenariat({ nom: 'Réseau' })).toStrictEqual({
      structuresPartenaires: [{}],
      nom: 'Réseau',
    })
  })

  it('garde les structures partenaires reprises', () => {
    expect(
      departDuPartenariat({ structuresPartenaires: [{ nom: 'Mairie' }] }),
    ).toStrictEqual({ structuresPartenaires: [{ nom: 'Mairie' }] })
  })
})
