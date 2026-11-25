import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { CreerLieuActiviteValidation } from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import { horairesVides } from '@/features/lieux-activite/domain/saisie/horaires-d-ouverture'
import {
  DescriptionSaisie,
  InformationsGeneralesSaisie,
  InformationsPratiquesSaisie,
  ModalitesAccesAuServiceSaisie,
  ModifierLaFicheDuLieuValidation,
  TypesDePublicsAccueillisSaisie,
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
    openingHours: horairesVides,
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

    it.each([['123'], ['12345678901234'], ['abcdefghijklmn']])(
      'refuse le SIRET %s',
      (siret) => {
        expect(informationsGenerales({ siret })).toBe(false)
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

    it.each([['12'], ['poste 1234'], ['+32 470 44 25 43']])(
      'refuse %s',
      (numero) => {
        expect(numeroTelephone(numero)).toBe(false)
      },
    )
  })
})

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

  it('n’exige rien quand aucune case n’est cochée', () => {
    expect(modalites({}).success).toBe(true)
  })

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

const creation = CreerLieuActiviteValidation

const adresseDeReference = {
  id: '51454_7160_00012',
  label: '12 rue de la Paix, 51100 Reims',
  nom: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  contexte: '51, Marne, Grand Est',
  latitude: 49.25,
  longitude: 4.03,
}

const grilleVide = {
  Mo: { am: { isOpen: false }, pm: { isOpen: false } },
  Tu: { am: { isOpen: false }, pm: { isOpen: false } },
  We: { am: { isOpen: false }, pm: { isOpen: false } },
  Th: { am: { isOpen: false }, pm: { isOpen: false } },
  Fr: { am: { isOpen: false }, pm: { isOpen: false } },
  Sa: { am: { isOpen: false }, pm: { isOpen: false } },
  Su: { am: { isOpen: false }, pm: { isOpen: false } },
}

const saisieDeCreation = (champs: Record<string, unknown>) => ({
  nom: 'Maison France Services',
  adresseBan: adresseDeReference,
  typologies: ['TIERS_LIEUX'],
  openingHours: grilleVide,
  visiblePourCartographieNationale: false,
  services: [],
  ...champs,
})

const verdicts = {
  nom: (nom: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ nom })).success,
    modification: InformationsGeneralesSaisie.safeParse({
      section: 'InformationsGenerales',
      nom,
      adresseBan: adresseDeReference,
      typologies: ['TIERS_LIEUX'],
    }).success,
  }),
  moyenDeContact: (coche: unknown) => ({
    creation: creation.safeParse(
      saisieDeCreation({ modalitesAcces: { surPlace: coche } }),
    ).success,
    modification: ModalitesAccesAuServiceSaisie.safeParse({
      section: 'ModalitesAccesAuService',
      surPlace: coche,
      fraisACharge: [],
    }).success,
  }),
  toutPublic: (toutPublic: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ toutPublic })).success,
    modification: TypesDePublicsAccueillisSaisie.safeParse({
      section: 'TypesDePublicsAccueillis',
      toutPublic,
      publicsSpecifiquementAdresses: [],
      priseEnChargeSpecifique: [],
    }).success,
  }),
  siteWeb: (siteWeb: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ siteWeb })).success,
    modification: InformationsPratiquesSaisie.safeParse({
      section: 'InformationsPratiques',
      siteWeb,
      openingHours: grilleVide,
    }).success,
  }),
  ficheAccesLibre: (ficheAccesLibre: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ ficheAccesLibre })).success,
    modification: InformationsPratiquesSaisie.safeParse({
      section: 'InformationsPratiques',
      ficheAccesLibre,
      openingHours: grilleVide,
    }).success,
  }),
  priseRdv: (priseRdv: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ priseRdv })).success,
    modification: InformationsPratiquesSaisie.safeParse({
      section: 'InformationsPratiques',
      priseRdv,
      openingHours: grilleVide,
    }).success,
  }),
  numeroTelephone: (numeroTelephone: unknown) => ({
    creation: creation.safeParse(
      saisieDeCreation({
        modalitesAcces: { parTelephone: true, numeroTelephone },
      }),
    ).success,
    modification: ModalitesAccesAuServiceSaisie.safeParse({
      section: 'ModalitesAccesAuService',
      surPlace: false,
      parTelephone: true,
      numeroTelephone,
      parMail: false,
      fraisACharge: [],
    }).success,
  }),
  adresseMail: (adresseMail: unknown) => ({
    creation: creation.safeParse(
      saisieDeCreation({ modalitesAcces: { parMail: true, adresseMail } }),
    ).success,
    modification: ModalitesAccesAuServiceSaisie.safeParse({
      section: 'ModalitesAccesAuService',
      surPlace: false,
      parTelephone: false,
      parMail: true,
      adresseMail,
      fraisACharge: [],
    }).success,
  }),
  presentationDetail: (presentationDetail: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ presentationDetail }))
      .success,
    modification: DescriptionSaisie.safeParse({
      section: 'Description',
      presentationDetail,
      formationsLabels: [],
    }).success,
  }),
  complementAdresse: (complementAdresse: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ complementAdresse }))
      .success,
    modification: InformationsGeneralesSaisie.safeParse({
      section: 'InformationsGenerales',
      nom: 'Maison France Services',
      adresseBan: adresseDeReference,
      complementAdresse,
      typologies: ['TIERS_LIEUX'],
    }).success,
  }),
  presentationResume: (presentationResume: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ presentationResume }))
      .success,
    modification: DescriptionSaisie.safeParse({
      section: 'Description',
      presentationResume,
      formationsLabels: [],
    }).success,
  }),
  horaires: (openingHours: unknown) => ({
    creation: creation.safeParse(saisieDeCreation({ openingHours })).success,
    modification: InformationsPratiquesSaisie.safeParse({
      section: 'InformationsPratiques',
      openingHours,
    }).success,
  }),
}

const journeeOuverte = (heures: { startTime?: string; endTime?: string }) => ({
  ...grilleVide,
  Mo: { am: { isOpen: true, ...heures }, pm: { isOpen: false } },
})

describe('les deux formulaires appliquent les mêmes règles', () => {
  it.each([
    ['nom', 'Maison France Services', true],
    ['nom', '   ', false],

    ['siteWeb', 'https://un.example.fr', true],
    ['siteWeb', 'https://un.example.fr|https://deux.example.fr', true],
    ['siteWeb', 'https://un.example.fr|coucou', false],
    ['siteWeb', 'coucou', false],
    ['siteWeb', null, true],

    [
      'ficheAccesLibre',
      'https://acceslibre.beta.gouv.fr/app/51-reims/a/x/',
      true,
    ],
    ['ficheAccesLibre', 'https://example.fr', false],
    ['ficheAccesLibre', 'https://acceslibre.beta.gouv.fr/pas une url', false],

    ['priseRdv', 'https://rdv.example.fr', true],
    ['priseRdv', 'pas-une-url', false],

    ['numeroTelephone', '01 02 03 04 05', true],
    ['numeroTelephone', '01.02.03.04.05', true],
    ['numeroTelephone', '+33 1 02 03 04 05', true],
    ['numeroTelephone', '0033102030405', true],
    ['numeroTelephone', '02 62 20 20 20', true],
    ['numeroTelephone', '12', false],
    ['numeroTelephone', '+32 470 44 25 43', false],

    ['complementAdresse', 'Bâtiment B', true],
    ['complementAdresse', 'Bât. 3 (entrée côté parking)', true],
    ['complementAdresse', '1er étage / bureau 12', true],
    ['complementAdresse', 'Hall A — porte gauche', true],
    ['complementAdresse', 'Local n°12 & annexe', true],
    ['complementAdresse', null, true],
    ['complementAdresse', 'Appt #4', false],
    ['complementAdresse', 'Zone d’activité 50 %', false],

    ['presentationResume', 'x'.repeat(280), true],
    ['presentationResume', 'x'.repeat(281), false],

    ['presentationDetail', 'x'.repeat(10_000), true],
    ['presentationDetail', 'x'.repeat(10_001), false],

    ['adresseMail', 'contact@example.fr', true],
    ['adresseMail', `${'x'.repeat(65)}@example.fr`, false],
    ['adresseMail', `contact@${'y'.repeat(250)}.fr`, false],
    ['adresseMail', 'jean+lieu@example.fr', true],
    ['adresseMail', 'contact@example', false],
  ])('%s : « %s » vaut %s des deux côtés', (champ, valeur, attendu) => {
    expect(verdicts[champ as keyof typeof verdicts](valeur)).toEqual({
      creation: attendu,
      modification: attendu,
    })
  })

  describe('horaires', () => {
    it('accepte une demi-journée ouverte et renseignée', () => {
      expect(
        verdicts.horaires(
          journeeOuverte({ startTime: '09:00', endTime: '12:00' }),
        ),
      ).toEqual({ creation: true, modification: true })
    })

    it('refuse une demi-journée ouverte sans heures', () => {
      expect(verdicts.horaires(journeeOuverte({}))).toEqual({
        creation: false,
        modification: false,
      })
    })

    it('refuse une heure qui n’en est pas une', () => {
      expect(
        verdicts.horaires(
          journeeOuverte({ startTime: '9h', endTime: '12:00' }),
        ),
      ).toEqual({ creation: false, modification: false })
    })
  })

  describe('l’adresse choisie', () => {
    const avecAdresse = (nom: string) => {
      const ban = { ...adresseDeReference, nom }

      return {
        creation: creation.safeParse(saisieDeCreation({ adresseBan: ban }))
          .success,
        modification: InformationsGeneralesSaisie.safeParse({
          section: 'InformationsGenerales',
          nom: 'Maison France Services',
          adresseBan: ban,
          typologies: ['TIERS_LIEUX'],
        }).success,
      }
    }

    it('accepte une voie que le standard reconnaît', () => {
      expect(avecAdresse('12 rue de la Paix')).toEqual({
        creation: true,
        modification: true,
      })
    })

    it('refuse une voie que le standard ne reconnaît pas', () => {
      expect(avecAdresse('-12 rue de la Paix')).toEqual({
        creation: false,
        modification: false,
      })
    })
  })

  describe('le commentaire des horaires', () => {
    const avecCommentaire = (openingHours: unknown) => ({
      creation: creation.safeParse(
        saisieDeCreation({ openingHours, horairesComment: 'Sur rendez-vous' }),
      ).success,
      modification: InformationsPratiquesSaisie.safeParse({
        section: 'InformationsPratiques',
        openingHours,
        horairesComment: 'Sur rendez-vous',
      }).success,
    })

    it('s’accepte adossé à un créneau', () => {
      expect(
        avecCommentaire(
          journeeOuverte({ startTime: '09:00', endTime: '12:00' }),
        ),
      ).toEqual({ creation: true, modification: true })
    })

    it('se refuse quand la grille est vide', () => {
      expect(avecCommentaire(grilleVide)).toEqual({
        creation: false,
        modification: false,
      })
    })
  })

  describe('« ce lieu accueille tout public »', () => {
    it('accepte que la case soit cochée', () => {
      expect(verdicts.toutPublic(true)).toEqual({
        creation: true,
        modification: true,
      })
    })

    it('accepte que la case soit décochée, qui se dit `null`', () => {
      expect(verdicts.toutPublic(null)).toEqual({
        creation: true,
        modification: true,
      })
    })

    it('accepte la case absente', () => {
      expect(verdicts.toutPublic(undefined)).toEqual({
        creation: true,
        modification: true,
      })
    })
  })

  describe('les moyens de contact', () => {
    it('acceptent une case cochée', () => {
      expect(verdicts.moyenDeContact(true)).toEqual({
        creation: true,
        modification: true,
      })
    })

    it('acceptent une case décochée, qui se dit `null`', () => {
      expect(verdicts.moyenDeContact(null)).toEqual({
        creation: true,
        modification: true,
      })
    })
  })
})
