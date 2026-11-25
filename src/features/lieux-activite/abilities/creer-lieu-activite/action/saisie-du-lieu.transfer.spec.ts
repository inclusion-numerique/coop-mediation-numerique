import {
  Itinerance,
  ModaliteAcces,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Schedule } from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { describe, expect, it } from 'vitest'
import {
  type CreerLieuActiviteData,
  CreerLieuActiviteValidation,
} from '@/features/lieux-activite/action/creer-lieu-activite.validation'
import type { Fiche } from '@/features/lieux-activite/domain/fiche'
import { horairesVides } from '@/features/lieux-activite/domain/saisie/horaires-d-ouverture'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import { nouveauLieu } from './saisie-du-lieu.transfer'

const auteur = UtilisateurId('550e8400-e29b-41d4-a716-446655440001')
const maintenant = new Date('2026-09-07T10:00:00Z')
const LIEU_ID = LieuId('550e8400-e29b-41d4-a716-446655440099')

const saisie = (
  champs: Partial<CreerLieuActiviteData> = {},
): CreerLieuActiviteData => ({
  nom: 'Tiers-lieu du Port',
  adresseBan: {
    id: '17299_0123_00012',
    label: '12 quai du Port, 17300 Rochefort',
    nom: '12 quai du Port',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    contexte: '17, Charente-Maritime',
    latitude: 45.94,
    longitude: -0.96,
  },
  complementAdresse: null,
  lieuItinerant: null,
  typologies: [Typologie.BIB],
  visiblePourCartographieNationale: false,
  presentationResume: null,
  presentationDetail: null,
  formationsLabels: [],
  siteWeb: null,
  ficheAccesLibre: null,
  priseRdv: null,
  horairesComment: null,
  openingHours: horairesVides,
  modalitesAcces: null,
  fraisACharge: [],
  services: [],
  modalitesAccompagnement: [],
  priseEnChargeSpecifique: [],
  toutPublic: true,
  publicsSpecifiquementAdresses: [],
  ...champs,
})

const lieuDe = (champs: Partial<CreerLieuActiviteData> = {}) =>
  nouveauLieu(saisie(champs), auteur, maintenant, LIEU_ID)

describe('l’identité du lieu créé', () => {
  it('porte le nom, l’adresse et la localisation reconnus par la BAN', () => {
    expect(lieuDe().fiche).toMatchObject({
      nom: 'Tiers-lieu du Port',
      adresse: {
        voie: '12 quai du Port',
        commune: 'Rochefort',
        code_postal: '17300',
        code_insee: '17299',
      },
      localisation: { latitude: 45.94, longitude: -0.96 },
    })
  })

  it('retient l’identifiant BAN de l’adresse choisie', () => {
    expect(lieuDe().banId).toBe('17299_0123_00012')
  })

  it('ajoute le complément d’adresse quand il est saisi', () => {
    expect(lieuDe({ complementAdresse: 'Bâtiment B' }).fiche.adresse).toEqual(
      expect.objectContaining({ complement_adresse: 'Bâtiment B' }),
    )
  })

  it('n’a jamais d’immatriculation', () => {
    expect(lieuDe().fiche.pivot).toBeNull()
  })

  it('n’a ni identité de cartographie ni identité SIRENE', () => {
    const lieu = lieuDe()

    expect(lieu.idsCartographieNationale).toBeNull()
    expect(lieu.identiteSirene).toEqual({
      nomUsage: null,
      synchronisation: null,
    })
  })

  it.each([
    [true, [Itinerance.Itinerant]],
    [false, [Itinerance.Fixe]],
    [null, []],
  ])('dit l’itinérance en liste : %s devient %s', (lieuItinerant, attendu) => {
    expect(lieuDe({ lieuItinerant }).fiche.itinerance).toEqual(attendu)
  })
})

describe('la visibilité sur la cartographie', () => {
  it.each([
    [true, 'Publie'],
    [false, 'NonPublie'],
  ])('%s devient %s', (visiblePourCartographieNationale, attendu) => {
    expect(lieuDe({ visiblePourCartographieNationale }).visibilite).toBe(
      attendu,
    )
  })
})

describe('le contact', () => {
  const joignable = {
    surPlace: true,
    parTelephone: true,
    numeroTelephone: '01 02 03 04 05',
    parMail: true,
    adresseMail: 'contact@example.fr',
  }

  it('normalise le téléphone et retient le courriel', () => {
    expect(lieuDe({ modalitesAcces: joignable }).fiche.contact).toEqual({
      telephone: '+33102030405',
      courriels: ['contact@example.fr'],
    })
  })

  it('ignore les moyens dont la case n’est pas cochée', () => {
    expect(
      lieuDe({
        modalitesAcces: { ...joignable, parTelephone: false, parMail: false },
      }).fiche.contact,
    ).toEqual({})
  })

  it('découpe les sites web du schéma national et les ordonne', () => {
    expect(
      lieuDe({ siteWeb: 'https://un.fr|https://deux.fr' }).fiche.contact
        .site_web,
    ).toEqual(['https://deux.fr', 'https://un.fr'])
  })

  it('déduit les modalités d’accès des cases cochées', () => {
    expect(
      lieuDe({ modalitesAcces: { ...joignable, parMail: false } }).fiche
        .modalitesAcces,
    ).toEqual([ModaliteAcces.SePresenter, ModaliteAcces.Telephoner])
  })
})

describe('les publics accueillis', () => {
  it('n’en vise aucun quand le lieu est tout public', () => {
    expect(
      lieuDe({
        toutPublic: true,
        publicsSpecifiquementAdresses: [PublicSpecifiquementAdresse.Jeunes],
      }).fiche.publicsSpecifiquementAdresses,
    ).toEqual([])
  })

  it('retient ceux qui sont visés quand le lieu n’est pas tout public', () => {
    expect(
      lieuDe({
        toutPublic: false,
        publicsSpecifiquementAdresses: [PublicSpecifiquementAdresse.Jeunes],
      }).fiche.publicsSpecifiquementAdresses,
    ).toEqual([PublicSpecifiquementAdresse.Jeunes])
  })
})

describe('les horaires', () => {
  const lundiMatin: Schedule = {
    ...horairesVides,
    Mo: {
      am: { startTime: '09:00', endTime: '12:00', isOpen: true },
      pm: { startTime: null, endTime: null, isOpen: false },
    },
  }

  it('se composent depuis la grille hebdomadaire', () => {
    expect(lieuDe({ openingHours: lundiMatin }).fiche.horaires).toBe(
      'Mo 09:00-12:00',
    )
  })

  it('portent leur commentaire une seule fois', () => {
    expect(
      lieuDe({
        openingHours: lundiMatin,
        horairesComment: 'Fermé le premier lundi',
      }).fiche.horaires,
    ).toBe('Mo 09:00-12:00 "Fermé le premier lundi"')
  })

  it('valent null quand la grille est vide', () => {
    expect(lieuDe().fiche.horaires).toBeNull()
  })
})

describe('ce que le formulaire laisse vide', () => {
  it('devient des listes vides plutôt que des absences', () => {
    expect(lieuDe().fiche).toMatchObject({
      services: [],
      modalitesAccompagnement: [],
      fraisACharge: [],
      formationsLabels: [],
      priseEnChargeSpecifique: [],
      dispositifProgrammesNationaux: [],
      autresFormationsLabels: [],
    })
  })

  it('retient les services annoncés', () => {
    expect(
      lieuDe({ services: [Service.AideAuxDemarchesAdministratives] }).fiche
        .services,
    ).toEqual([Service.AideAuxDemarchesAdministratives])
  })

  it('laisse la présentation à null quand rien n’est écrit', () => {
    expect(lieuDe().fiche.presentation).toBeNull()
  })
})

describe('la traçabilité', () => {
  it('date la création et en nomme l’auteur', () => {
    expect(lieuDe().tracabilite).toEqual({
      creation: { date: maintenant, par: auteur },
      derniereModification: {
        _tag: 'ParUtilisateur',
        date: maintenant,
        par: auteur,
      },
      suppression: { _tag: 'Actif' },
    })
  })

  it('porte l’identifiant qui lui est attribué', () => {
    expect(lieuDe().id).toBe(LIEU_ID)
  })
})

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

const lundiMatin = {
  ...grilleVide,
  Mo: {
    am: { isOpen: true, startTime: '09:00', endTime: '12:00' },
    pm: { isOpen: false },
  },
}

const saisieMinimale = {
  nom: 'Maison France Services',
  adresseBan,
  complementAdresse: null,
  lieuItinerant: null,
  typologies: ['TIERS_LIEUX'],
  visiblePourCartographieNationale: false,
  presentationResume: null,
  presentationDetail: null,
  formationsLabels: [],
  siteWeb: null,
  ficheAccesLibre: null,
  priseRdv: null,
  horairesComment: null,
  openingHours: grilleVide,
  services: [],
  modalitesAccompagnement: [],
  modalitesAcces: {},
  fraisACharge: [],
  priseEnChargeSpecifique: [],
  toutPublic: null,
  publicsSpecifiquementAdresses: [],
}

const ficheDe = (champs: Record<string, unknown>): Fiche | null => {
  const analyse = CreerLieuActiviteValidation.safeParse({
    ...saisieMinimale,
    ...champs,
  })

  return analyse.success
    ? nouveauLieu(analyse.data, auteur, new Date(), LIEU_ID).fiche
    : null
}

const renseigne = (valeur: unknown): boolean =>
  valeur != null &&
  valeur !== '' &&
  !(Array.isArray(valeur) && valeur.length === 0)

const CHAMPS: [string, Record<string, unknown>, (fiche: Fiche) => unknown][] = [
  ['nom', { nom: 'Tiers-lieu du Port' }, (f) => f.nom],
  ['adresse', {}, (f) => f.adresse],
  [
    'complément d’adresse',
    { complementAdresse: 'Bâtiment B' },
    (f) => f.adresse?.complement_adresse,
  ],
  ['localisation', {}, (f) => f.localisation],
  ['typologies', { typologies: ['TIERS_LIEUX'] }, (f) => f.typologies],
  [
    'site web',
    { siteWeb: 'https://un.example.fr|https://deux.example.fr' },
    (f) => f.contact.site_web,
  ],
  [
    'téléphone',
    {
      modalitesAcces: { parTelephone: true, numeroTelephone: '01 02 03 04 05' },
    },
    (f) => f.contact.telephone,
  ],
  [
    'courriel',
    { modalitesAcces: { parMail: true, adresseMail: 'contact@example.fr' } },
    (f) => f.contact.courriels,
  ],
  [
    'horaires',
    { openingHours: lundiMatin, horairesComment: 'Sur rendez-vous' },
    (f) => f.horaires,
  ],
  [
    'présentation (résumé seul)',
    { presentationResume: 'Un résumé' },
    (f) => f.presentation,
  ],
  [
    'présentation (détail seul)',
    { presentationDetail: 'Un détail' },
    (f) => f.presentation,
  ],
  [
    'fiche Accès Libre',
    { ficheAccesLibre: 'https://acceslibre.beta.gouv.fr/app/erp/le-lieu' },
    (f) => f.ficheAccesLibre,
  ],
  [
    'prise de rendez-vous',
    { priseRdv: 'https://rdv.example.fr' },
    (f) => f.priseRdv,
  ],
  [
    'services',
    { services: ['Aide aux démarches administratives'] },
    (f) => f.services,
  ],
  [
    'modalités d’accompagnement',
    { modalitesAccompagnement: ['En autonomie'] },
    (f) => f.modalitesAccompagnement,
  ],
  [
    'modalités d’accès',
    { modalitesAcces: { surPlace: true } },
    (f) => f.modalitesAcces,
  ],
  ['frais à charge', { fraisACharge: ['Gratuit'] }, (f) => f.fraisACharge],
  [
    'publics spécifiquement adressés',
    { publicsSpecifiquementAdresses: ['Jeunes'] },
    (f) => f.publicsSpecifiquementAdresses,
  ],
  [
    'prise en charge spécifique',
    { priseEnChargeSpecifique: ['Surdité'] },
    (f) => f.priseEnChargeSpecifique,
  ],
  [
    'formations et labels',
    { formationsLabels: ['Fabriques de Territoire'] },
    (f) => f.formationsLabels,
  ],
  ['itinérance', { lieuItinerant: true }, (f) => f.itinerance],
]

describe('une saisie acceptée n’est jamais perdue en silence', () => {
  it.each(CHAMPS)('%s', (_nom, champs, lu) => {
    const fiche = ficheDe(champs)

    expect(fiche).not.toBeNull()
    expect(fiche != null && renseigne(lu(fiche))).toBe(true)
  })

  it.each([
    ['nom vide', { nom: '   ' }],
    [
      'voie que le standard ne reconnaît pas',
      {
        adresseBan: { ...adresseBan, nom: '-12 rue de la Paix' },
      },
    ],
    ['complément hors du jeu de caractères', { complementAdresse: 'Appt #4' }],
    ['site web sans domaine', { siteWeb: 'https://w' }],
    [
      'fiche d’accessibilité ailleurs qu’Accès Libre',
      {
        ficheAccesLibre: 'https://example.fr',
      },
    ],
    [
      'téléphone étranger',
      {
        modalitesAcces: {
          parTelephone: true,
          numeroTelephone: '+32 470 44 25 43',
        },
      },
    ],
    [
      'courriel à partie locale trop longue',
      {
        modalitesAcces: {
          parMail: true,
          adresseMail: `${'x'.repeat(65)}@example.fr`,
        },
      },
    ],
    ['résumé trop long', { presentationResume: 'x'.repeat(281) }],
    ['détail trop long', { presentationDetail: 'x'.repeat(10_001) }],
    [
      'commentaire d’horaires sans créneau',
      {
        horairesComment: 'Sur rendez-vous',
      },
    ],
  ])('%s est refusé à la saisie', (_nom, champs) => {
    expect(ficheDe(champs)).toBeNull()
  })
})
