import { CreerLieuActiviteValidation } from '@app/web/features/lieux-activite/domain/creation/creer-lieu-activite.validation'
import {
  DescriptionSaisie,
  InformationsGeneralesSaisie,
  InformationsPratiquesSaisie,
  ModalitesAccesAuServiceSaisie,
  TypesDePublicsAccueillisSaisie,
} from './modifier-la-fiche-du-lieu.validation'

const creation = CreerLieuActiviteValidation

const adresseBan = {
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
  adresseBan,
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
      adresseBan,
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
      adresseBan,
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
      const ban = { ...adresseBan, nom }

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
