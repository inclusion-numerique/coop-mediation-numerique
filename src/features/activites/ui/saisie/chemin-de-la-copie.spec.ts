import { describe, expect, it } from 'vitest'
import { encodeSerializableState } from '@/libraries/parametres-d-url/encodeSerializableState'
import { cheminDeLaCopie, etatDeLUrl } from './chemin-de-la-copie'

describe('chemin de la copie', () => {
  it('rouvre la saisie du même type avec les valeurs copiées', () => {
    expect(cheminDeLaCopie('animation', { notes: 'copie' })).toBe(
      `/coop/mes-activites/cra/animation?v=${encodeSerializableState({ notes: 'copie' })}`,
    )
  })

  it('conserve la page de retour', () => {
    expect(
      cheminDeLaCopie('individuel', { notes: 'copie' }, '/coop/mes-activites'),
    ).toBe(
      `/coop/mes-activites/cra/individuel?retour=/coop/mes-activites&v=${encodeSerializableState({ notes: 'copie' })}`,
    )
  })
})

describe("état de l'URL", () => {
  it('part de valeurs vides sans état encodé', () => {
    expect(etatDeLUrl(undefined)).toStrictEqual({})
  })

  it("relit l'état encodé", () => {
    expect(
      etatDeLUrl(encodeSerializableState({ notes: 'reprise' })),
    ).toStrictEqual({ notes: 'reprise' })
  })
})
