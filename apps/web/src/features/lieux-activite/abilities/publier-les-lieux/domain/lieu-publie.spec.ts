import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuPublieSchema } from './lieu-publie'

const lieu = (champs: Record<string, unknown> = {}) => ({
  id: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
  nom: 'Espace numérique de Reims',
  adresse: {
    voie: '12 rue de la Paix',
    code_postal: '51100',
    code_insee: '51454',
    commune: 'Reims',
  },
  services: [Service.AideAuxDemarchesAdministratives],
  ...champs,
})

const publie = (champs: Record<string, unknown> = {}) =>
  LieuPublieSchema.safeParse(lieu(champs))

describe('ce que la coop verse à la cartographie nationale', () => {
  it('publie un lieu qui porte ce qu’il faut pour être désigné', () => {
    expect(publie().success).toBe(true)
  })

  describe('un champ facultatif invalide se perd, le lieu reste', () => {
    it.each([
      ['horaires', 'tous les jours sauf le mardi'],
      ['prise_rdv', 'appelez-nous'],
      ['fiche_acces_libre', 'https://acceslibre.fr/fiche'],
      ['localisation', { latitude: 120, longitude: 0 }],
      ['contact', { telephone: '00' }],
      ['presentation', { resume: 'x'.repeat(281) }],
      ['typologies', ['PAS_UNE_TYPOLOGIE']],
      ['source', '   '],
    ])('%s', (champ, valeur) => {
      const resultat = publie({ [champ]: valeur })

      expect(resultat.success).toBe(true)
      expect(
        resultat.success && (resultat.data as Record<string, unknown>)[champ],
      ).toBeUndefined()
    })
  })

  describe('un champ obligatoire invalide retire le lieu', () => {
    it.each([
      ['nom', '   '],
      ['adresse', { voie: '', code_postal: '51100', commune: 'Reims' }],
      ['adresse', undefined],
      ['services', []],
      ['id', ''],
    ])('%s', (champ, valeur) => {
      expect(publie({ [champ]: valeur }).success).toBe(false)
    })
  })

  /**
   * La colonne `site_web` de la coop joint plusieurs adresses par « | ». La
   * requête les découpe : les envelopper telles quelles publiait une seule URL
   * qui en contenait un, que `Url` refuse — et `Contact` tombant d'un bloc, le
   * téléphone et les courriels disparaissaient avec.
   */
  it('garde le contact quand plusieurs sites web sont déclarés', () => {
    const resultat = publie({
      contact: {
        telephone: '+33180059880',
        courriels: ['contact@example.fr'],
        site_web: ['https://un.example.fr', 'https://deux.example.fr'],
      },
    })

    expect(resultat.success && resultat.data.contact).toMatchObject({
      telephone: '+33180059880',
      site_web: ['https://deux.example.fr', 'https://un.example.fr'],
    })
  })

  it('perd le contact entier si un site web en contient plusieurs', () => {
    const resultat = publie({
      contact: {
        telephone: '+33180059880',
        site_web: ['https://un.example.fr|https://deux.example.fr'],
      },
    })

    expect(resultat.success && resultat.data.contact).toBeUndefined()
  })

  /**
   * L'ordre d'une liste ne porte aucune information : le premier courriel n'est
   * pas le contact principal. Sans cette règle, une même fiche se republiait
   * différemment d'une nuit à l'autre.
   */
  it('dédoublonne et ordonne les listes', () => {
    const resultat = publie({
      services: [
        Service.UtilisationSecuriseeDuNumerique,
        Service.AideAuxDemarchesAdministratives,
        Service.AideAuxDemarchesAdministratives,
      ],
    })

    expect(resultat.success && resultat.data.services).toEqual([
      Service.AideAuxDemarchesAdministratives,
      Service.UtilisationSecuriseeDuNumerique,
    ])
  })
})
