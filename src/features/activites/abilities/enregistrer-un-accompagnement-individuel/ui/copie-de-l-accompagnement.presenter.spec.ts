import { describe, expect, it } from 'vitest'
import { copieDeLAccompagnement } from './copie-de-l-accompagnement.presenter'

describe("copie de l'accompagnement", () => {
  it("oublie l'activité et le rendez-vous d'origine", () => {
    expect(
      copieDeLAccompagnement({
        id: 'a0000000-0000-4000-8000-000000000001',
        rdvServicePublicId: 4242,
        notes: 'Suivi',
      }),
    ).toStrictEqual({
      id: undefined,
      rdvServicePublicId: undefined,
      notes: 'Suivi',
    })
  })
})
