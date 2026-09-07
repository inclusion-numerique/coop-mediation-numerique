import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  InformationsGeneralesSaisie,
  InformationsPratiquesSaisie,
  ModalitesAccesAuServiceSaisie,
  ModifierLaFicheDuLieuValidation,
} from './modifier-la-fiche-du-lieu.validation'

const adresseBan = {
  id: '80144_0018_00090',
  label: '12 rue de la Paix, 51100 Reims',
  nom: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  contexte: '51, Marne, Grand Est',
  latitude: 49.25,
  longitude: 4.03,
}

const informationsGenerales = (
  immatriculation: { siret?: string | null; rna?: string | null } = {},
) =>
  InformationsGeneralesSaisie.safeParse({
    section: 'InformationsGenerales',
    nom: 'Maison France Services',
    adresseBan,
    complementAdresse: null,
    lieuItinerant: null,
    typologies: [Typologie.TIERS_LIEUX],
    nomUsage: null,
    ...immatriculation,
  }).success

const informationsPratiques = (
  champs: {
    siteWeb?: string | null
    ficheAccesLibre?: string | null
    priseRdv?: string | null
  } = {},
) =>
  InformationsPratiquesSaisie.safeParse({
    section: 'InformationsPratiques',
    siteWeb: null,
    ficheAccesLibre: null,
    priseRdv: null,
    openingHours: emptyOpeningHours,
    horairesComment: null,
    ...champs,
  }).success

const numeroTelephone = (numero: string | null) =>
  ModalitesAccesAuServiceSaisie.safeParse({
    section: 'ModalitesAccesAuService',
    surPlace: true,
    parTelephone: numero != null,
    numeroTelephone: numero,
    parMail: false,
    adresseMail: null,
    fraisACharge: [],
  }).success

describe('la saisie d’une section de fiche', () => {
  describe('immatriculation', () => {
    it('accepte une fiche sans immatriculation', () => {
      expect(informationsGenerales()).toBe(true)
    })

    it.each([['13002603200016'], ['356000000000000'.slice(0, 14)]])(
      'accepte le SIRET %s',
      (siret) => {
        expect(informationsGenerales({ siret })).toBe(true)
      },
    )

    // Ces deux-là passaient : le mapper les écartait ensuite en silence, et le
    // lieu perdait son immatriculation sans que rien ne soit dit.
    it.each([['123'], ['12345678901234'], ['abcdefghijklmn']])(
      'refuse le SIRET %s',
      (siret) => {
        expect(informationsGenerales({ siret })).toBe(false)
      },
    )

    it('accepte un RNA', () => {
      expect(informationsGenerales({ rna: 'W123456789' })).toBe(true)
    })

    it.each([['W12'], ['W12345678A'], ['123456789']])(
      'refuse le RNA %s',
      (rna) => {
        expect(informationsGenerales({ rna })).toBe(false)
      },
    )
  })

  describe('adresses web', () => {
    it('accepte plusieurs sites web joints par le séparateur du schéma', () => {
      expect(
        informationsPratiques({
          siteWeb: 'https://un.example.fr|https://deux.example.fr',
        }),
      ).toBe(true)
    })

    it('refuse la liste dès qu’un seul de ses sites n’en est pas un', () => {
      expect(
        informationsPratiques({ siteWeb: 'https://un.example.fr|coucou' }),
      ).toBe(false)
    })

    it('refuse un site web qui n’est pas une URL', () => {
      expect(informationsPratiques({ siteWeb: 'coucou' })).toBe(false)
    })

    it('refuse une prise de rendez-vous qui n’est pas une URL', () => {
      expect(informationsPratiques({ priseRdv: 'pas-une-url' })).toBe(false)
    })

    it('accepte une fiche Acceslibre', () => {
      expect(
        informationsPratiques({
          ficheAccesLibre:
            'https://acceslibre.beta.gouv.fr/app/51-reims/a/mfs/',
        }),
      ).toBe(true)
    })

    it('refuse une URL valide qui n’est pas Acceslibre', () => {
      expect(
        informationsPratiques({ ficheAccesLibre: 'https://example.fr' }),
      ).toBe(false)
    })

    // Le préfixe seul était vérifié : tout ce qui commençait par l'adresse
    // d'Acceslibre passait, URL ou non, pour être écarté ensuite en silence.
    it('refuse ce qui commence par Acceslibre sans être une URL', () => {
      expect(
        informationsPratiques({
          ficheAccesLibre: 'https://acceslibre.beta.gouv.fr/pas une url',
        }),
      ).toBe(false)
    })
  })

  describe('numéro de téléphone', () => {
    it.each([
      ['01 02 03 04 05'],
      ['01.02.03.04.05'],
      ['0102030405'],
      ['+33 1 02 03 04 05'],
      ['(+33) 1 02 03 04 05'],
      ['0033102030405'],
      ['02 62 20 20 20'],
      ['06 90 00 00 01'],
    ])('accepte %s, quelle que soit la façon de le taper', (numero) => {
      expect(numeroTelephone(numero)).toBe(true)
    })

    // Le schéma national n'admet que les indicatifs français et d'outre-mer :
    // un lieu paraît sur la cartographie nationale.
    it.each([['12'], ['poste 1234'], ['+32 470 44 25 43']])(
      'refuse %s',
      (numero) => {
        expect(numeroTelephone(numero)).toBe(false)
      },
    )
  })
})

/**
 * La saisie peut être incohérente, le domaine non : une case de contact cochée
 * sans son moyen ferait une fiche annonçant qu'on peut joindre ce lieu, sans de
 * quoi le joindre. La règle croise deux champs, elle se tient donc sur l'union
 * assemblée et non sur l'un d'eux.
 */
describe('une case de contact cochée exige son moyen', () => {
  const modalites = (champs: Record<string, unknown>) =>
    ModifierLaFicheDuLieuValidation.safeParse({
      id: '0927f824-b84d-4840-ae2e-e4a96a7a519b',
      modification: {
        section: 'ModalitesAccesAuService',
        surPlace: false,
        parTelephone: false,
        numeroTelephone: null,
        parMail: false,
        adresseMail: null,
        fraisACharge: [],
        ...champs,
      },
    })

  const messages = (issue: ReturnType<typeof modalites>) =>
    issue.success ? [] : issue.error.issues.map(({ message }) => message)

  it('refuse « par téléphone » sans numéro', () => {
    expect(messages(modalites({ parTelephone: true }))).toEqual([
      'Le numéro de téléphone est obligatoire.',
    ])
  })

  it('refuse « par mail » sans adresse', () => {
    expect(messages(modalites({ parMail: true }))).toEqual([
      "L'adresse email est obligatoire.",
    ])
  })

  it('dit les deux manques d’un coup', () => {
    expect(messages(modalites({ parTelephone: true, parMail: true }))).toEqual([
      'Le numéro de téléphone est obligatoire.',
      "L'adresse email est obligatoire.",
    ])
  })

  it('accepte les cases cochées avec leurs moyens', () => {
    expect(
      modalites({
        parTelephone: true,
        numeroTelephone: '01 02 03 04 05',
        parMail: true,
        adresseMail: 'contact@example.fr',
      }).success,
    ).toBe(true)
  })

  /** Décochées, les cases n'exigent rien. */
  it('n’exige rien quand aucune case n’est cochée', () => {
    expect(modalites({}).success).toBe(true)
  })

  /** La règle ne vaut que pour sa section : les autres ne la portent pas. */
  it('laisse passer une autre section', () => {
    expect(
      ModifierLaFicheDuLieuValidation.safeParse({
        id: '0927f824-b84d-4840-ae2e-e4a96a7a519b',
        modification: {
          section: 'ServicesEtAccompagnement',
          services: [],
          modalitesAccompagnement: [],
        },
      }).success,
    ).toBe(true)
  })
})
