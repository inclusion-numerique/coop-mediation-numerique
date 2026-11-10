import { destination } from './destination'
import type { LieuAuPanier } from './panier'

const RETOUR = '/coop/mes-lieux-activite'

const lieu = (champs: Partial<LieuAuPanier> = {}): LieuAuPanier => ({
  id: null,
  structureCartographieNationaleId: null,
  nom: 'Tiers-lieu du Port',
  siret: null,
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  ...champs,
})

describe('où mène l’ajout, une fois fait', () => {
  it('mène à la fiche du lieu quand un seul a été ajouté', () => {
    expect(destination([lieu()], ['lieu-rejoint'], RETOUR)).toBe(
      '/coop/mon-reseau/17/lieux/lieu-rejoint',
    )
  })

  it('revient d’où l’on vient quand plusieurs lieux ont été ajoutés', () => {
    expect(
      destination([lieu(), lieu({ nom: 'Autre' })], ['un', 'deux'], RETOUR),
    ).toBe(RETOUR)
  })

  it('revient d’où l’on vient quand le panier et les lieux rejoints divergent', () => {
    expect(destination([lieu(), lieu()], ['un'], RETOUR)).toBe(RETOUR)
  })

  it('revient d’où l’on vient quand rien n’a été rejoint', () => {
    expect(destination([lieu()], [], RETOUR)).toBe(RETOUR)
  })
})
