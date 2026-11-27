import { describe, expect, it } from 'vitest'
import { type DonneesAccueilRdv, rdvsPassesTotal } from './donnees-accueil-rdv'

const donnees: DonneesAccueilRdv = {
  aVenir: 3,
  prochain: null,
  passes: 2,
  honores: 5,
  dernier: null,
  organisationPrincipale: null,
}

describe('rdvsPassesTotal', () => {
  it('additionne les rendez-vous échus et ceux honorés sans compte rendu', () => {
    expect(rdvsPassesTotal(donnees)).toBe(7)
  })
})
