import type { CreerLieuActiviteData } from '@app/web/features/lieux-activite/formulaire/CreerLieuActiviteValidation'
import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import {
  Itinerance,
  ModaliteAcces,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Schedule } from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { UserId } from '../../../domain/user-id'
import { nouveauLieu } from './depuis-la-saisie'

const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')
const maintenant = new Date('2026-09-07T10:00:00Z')

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
  openingHours: emptyOpeningHours,
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
  nouveauLieu(saisie(champs), auteur, maintenant)

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

  /**
   * On ne crée un lieu que lorsque la recherche par nom, adresse ou SIRET n'a
   * rien rendu : il n'y a donc rien à immatriculer.
   */
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

  /** Les cases commandent les champs : décochées, leur contenu ne part pas. */
  it('ignore les moyens dont la case n’est pas cochée', () => {
    expect(
      lieuDe({
        modalitesAcces: { ...joignable, parTelephone: false, parMail: false },
      }).fiche.contact,
    ).toEqual({})
  })

  it('découpe les sites web joints par le séparateur du schéma national', () => {
    expect(
      lieuDe({ siteWeb: 'https://un.fr|https://deux.fr' }).fiche.contact
        .site_web,
    ).toEqual(['https://un.fr', 'https://deux.fr'])
  })

  it('déduit les modalités d’accès des cases cochées', () => {
    expect(
      lieuDe({ modalitesAcces: { ...joignable, parMail: false } }).fiche
        .modalitesAcces,
    ).toEqual([ModaliteAcces.SePresenter, ModaliteAcces.Telephoner])
  })
})

describe('les publics accueillis', () => {
  /** « Tout public » se traduit par l'absence de public visé. */
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
    ...emptyOpeningHours,
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

  /** Le commentaire s'écrivait deux fois quand la saisie le composait déjà. */
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

  it('donne au lieu un identifiant qui lui est propre', () => {
    expect(lieuDe().id).not.toBe(lieuDe().id)
  })
})
