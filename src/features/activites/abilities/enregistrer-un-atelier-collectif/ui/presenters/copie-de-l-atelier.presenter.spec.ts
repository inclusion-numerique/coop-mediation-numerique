import { describe, expect, it } from 'vitest'
import { copieDeLAtelier } from './copie-de-l-atelier.presenter'

describe("copie de l'atelier", () => {
  it("oublie l'activité, le rendez-vous et le décompte anonyme d'origine", () => {
    expect(
      copieDeLAtelier({
        id: 'a0000000-0000-4000-8000-000000000001',
        rdvServicePublicId: 4242,
        titreAtelier: 'Atelier e-mail',
        participantsAnonymes: {
          id: 'b0000000-0000-4000-8000-000000000001',
          total: 3,
        },
      }),
    ).toStrictEqual({
      id: undefined,
      rdvServicePublicId: undefined,
      titreAtelier: 'Atelier e-mail',
      participantsAnonymes: { id: undefined, total: 3 },
    })
  })

  it("laisse les participants anonymes absents quand l'atelier n'en a pas", () => {
    expect(copieDeLAtelier({ titreAtelier: 'Atelier e-mail' })).toStrictEqual({
      id: undefined,
      rdvServicePublicId: undefined,
      titreAtelier: 'Atelier e-mail',
      participantsAnonymes: undefined,
    })
  })
})
