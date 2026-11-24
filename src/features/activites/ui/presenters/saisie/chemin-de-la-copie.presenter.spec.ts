import { describe, expect, it } from 'vitest'
import { encodeSerializableState } from '@/libraries/etat-encode/encode-serializable-state'
import { cheminDeLaCopie, etatDeLUrl } from './chemin-de-la-copie.presenter'

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
      `/coop/mes-activites/cra/individuel?retour=%2Fcoop%2Fmes-activites&v=${encodeSerializableState({ notes: 'copie' })}`,
    )
  })

  it('garde dans le retour les filtres de la page quittée', () => {
    expect(
      cheminDeLaCopie(
        'individuel',
        { notes: 'copie' },
        '/coop/mes-activites?du=2026-01-01&au=2026-02-01',
      ),
    ).toBe(
      `/coop/mes-activites/cra/individuel?retour=%2Fcoop%2Fmes-activites%3Fdu%3D2026-01-01%26au%3D2026-02-01&v=${encodeSerializableState({ notes: 'copie' })}`,
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
