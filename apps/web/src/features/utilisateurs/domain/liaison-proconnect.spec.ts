import {
  estRevoquee,
  FournisseurIdentite,
  IdentifiantFournisseur,
  type LiaisonProConnect,
  revoquer,
} from './liaison-proconnect'

const liaison: LiaisonProConnect = {
  fournisseur: FournisseurIdentite('proconnect'),
  identifiantChezLeFournisseur: IdentifiantFournisseur('sub-123'),
  acces: { _tag: 'actif' },
}

describe('liaison ProConnect', () => {
  it('coupe l’accès', () => {
    expect(estRevoquee(revoquer(liaison))).toBe(true)
  })

  // Le contrat de résurrection : NextAuth retrouve la personne par
  // `@@unique([provider, providerAccountId])` et non par courriel. Perdre ces
  // deux valeurs à la révocation, c'est perdre le compte pour toujours.
  it('conserve de quoi retrouver la personne à sa reconnexion', () => {
    const revoquee = revoquer(liaison)

    expect(revoquee.fournisseur).toBe(liaison.fournisseur)
    expect(revoquee.identifiantChezLeFournisseur).toBe(
      liaison.identifiantChezLeFournisseur,
    )
  })

  it('ne modifie pas la liaison d’origine', () => {
    revoquer(liaison)

    expect(estRevoquee(liaison)).toBe(false)
  })
})
