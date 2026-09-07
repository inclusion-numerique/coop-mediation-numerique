import { z } from 'zod'
import {
  DescriptionSaisie,
  InformationsGeneralesSaisie,
  InformationsPratiquesSaisie,
  ModalitesAccesAuServiceSaisie,
  TypesDePublicsAccueillisSaisie,
} from '../abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.validation'
import { CreerLieuShape } from '../formulaire/CreerLieuShape'

/**
 * Créer un lieu et corriger sa fiche décrivent le même objet : une valeur que
 * l'un accepte, l'autre l'accepte aussi.
 *
 * Ce fichier confronte les deux formulaires aux mêmes saisies. Il ne teste pas
 * une règle en particulier — chacune a son message et sa raison là où elle est
 * écrite — mais l'absence d'écart entre les deux portes d'entrée. C'est ce qui a
 * manqué : le téléphone se rangeait sous deux formes, la liste de sites web
 * passait d'un côté et pas de l'autre.
 */
const creation = z.object(CreerLieuShape)

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

/** Les deux verdicts, pour une même valeur, champ par champ. */
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
  /**
   * « Se présenter » : le moyen de contact qui n'exige rien d'autre, donc celui
   * qui isole le contrat de la case elle-même.
   */
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
    // La liste jointe par « | » du schéma national : le mapper la découpe des
    // deux côtés, la création la refusait.
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

    // Le numéro se tape comme on veut, pourvu qu'on sache le reconnaître.
    ['numeroTelephone', '01 02 03 04 05', true],
    ['numeroTelephone', '01.02.03.04.05', true],
    ['numeroTelephone', '+33 1 02 03 04 05', true],
    ['numeroTelephone', '0033102030405', true],
    ['numeroTelephone', '02 62 20 20 20', true],
    ['numeroTelephone', '12', false],
    // Le schéma national n'admet que les indicatifs français et d'outre-mer.
    ['numeroTelephone', '+32 470 44 25 43', false],

    ['presentationResume', 'x'.repeat(280), true],
    ['presentationResume', 'x'.repeat(281), false],
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

    // La grille de la création exigeait les heures sans vérifier leur format,
    // celle de la modification l'inverse.
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

  describe('« ce lieu accueille tout public »', () => {
    it('accepte que la case soit cochée', () => {
      expect(verdicts.toutPublic(true)).toEqual({
        creation: true,
        modification: true,
      })
    })

    /**
     * Le groupe de cases à cocher rend `null` quand aucune n'est cochée. La
     * modification exigeait un booléen : décocher « tout public » rendait donc
     * impossible d'enregistrer des publics spécifiques sur un lieu existant,
     * avec un « Expected boolean, received null » à l'écran.
     */
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

    /**
     * Même piège que « tout public » : le composant rend `null` au décochage.
     * La modification exigeait un booléen, et décocher « Téléphoner » ou
     * « Contacter par mail » interdisait d'enregistrer la section.
     */
    it('acceptent une case décochée, qui se dit `null`', () => {
      expect(verdicts.moyenDeContact(null)).toEqual({
        creation: true,
        modification: true,
      })
    })
  })
})
