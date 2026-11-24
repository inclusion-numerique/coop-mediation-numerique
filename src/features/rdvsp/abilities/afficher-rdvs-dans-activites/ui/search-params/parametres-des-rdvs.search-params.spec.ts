import { describe, expect, it } from 'vitest'
import { sansLesFiltresDesRdvs } from './parametres-des-rdvs.search-params'

describe('paramètres des rendez-vous', () => {
  it("retire les filtres de rendez-vous portés par l'URL", () => {
    expect(sansLesFiltresDesRdvs()).toStrictEqual({
      rdvs: null,
      'voir-rdvs': null,
    })
  })
})
