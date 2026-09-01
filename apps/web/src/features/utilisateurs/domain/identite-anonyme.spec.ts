import { AdresseCourriel } from './adresse-courriel'
import { CourrielHash } from './courriel-hash'
import { estCourrielAnonymise, identiteAnonyme } from './identite-anonyme'

const EMPREINTE = CourrielHash('abcdef012345')

describe('identité anonyme', () => {
  it('remplace nom, prénom et courriel d’un seul tenant', () => {
    expect(identiteAnonyme(EMPREINTE)).toEqual({
      prenom: 'Utilisateur',
      nom: 'Supprimé',
      nomComplet: 'Utilisateur Supprimé',
      courriel: 'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
    })
  })

  // La détermination est ce qui rend le rejeu sûr : une seconde suppression ne
  // doit pas donner une nouvelle adresse.
  it('rend le même courriel pour la même empreinte', () => {
    expect(identiteAnonyme(EMPREINTE).courriel).toBe(
      identiteAnonyme(EMPREINTE).courriel,
    )
  })
})

describe('courriel déjà anonymisé', () => {
  it('reconnaît une adresse qu’il a lui-même fabriquée', () => {
    expect(estCourrielAnonymise(identiteAnonyme(EMPREINTE).courriel)).toBe(true)
  })

  it('ne reconnaît pas une adresse ordinaire', () => {
    expect(estCourrielAnonymise(AdresseCourriel('mediateur@example.com'))).toBe(
      false,
    )
  })

  // Deux pièges symétriques : le préfixe seul ne suffit pas, le domaine non
  // plus. Les confondre rattraperait des comptes vivants, ou en laisserait
  // d'effacés sans identité.
  it('exige le domaine, pas seulement le préfixe', () => {
    expect(
      estCourrielAnonymise(AdresseCourriel('deleted+abc@example.com')),
    ).toBe(false)
  })

  it('exige le préfixe, pas seulement le domaine', () => {
    expect(
      estCourrielAnonymise(
        AdresseCourriel('edith@coop-numerique.anct.gouv.fr'),
      ),
    ).toBe(false)
  })
})
