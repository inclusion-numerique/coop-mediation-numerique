import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { nouveauLieu } from '../abilities/creer-lieu-activite/action/depuis-la-saisie'
import type { CreerLieuActiviteData } from '../formulaire/CreerLieuActiviteValidation'
import { CreerLieuActiviteValidation } from '../formulaire/CreerLieuActiviteValidation'
import type { Fiche } from './fiche'

/**
 * Ce qu'une saisie acceptée doit devenir : quelque chose.
 *
 * Le formulaire et le domaine lisent chacun la même valeur, et le domaine est
 * le plus strict des deux. Toute règle qui vit d'un seul côté se paie de la même
 * façon : l'enregistrement réussit, le champ revient vide, et rien n'a été dit.
 *
 * Ce fichier tient la promesse inverse. Pour chaque champ, il confronte des
 * valeurs que le formulaire accepte à ce que le domaine en retient : si le
 * domaine les jette, c'est que la règle manque à la saisie. Un champ ajouté sans
 * sa règle fait donc échouer un test plutôt que d'effacer une saisie en silence.
 */

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

const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')

/** La fiche telle que le domaine la retient, ou `null` si la saisie est refusée. */
const ficheDe = (champs: Record<string, unknown>): Fiche | null => {
  const analyse = CreerLieuActiviteValidation.safeParse({
    ...saisieMinimale,
    ...champs,
  })

  return analyse.success
    ? nouveauLieu(analyse.data as CreerLieuActiviteData, auteur, new Date())
        .fiche
    : null
}

const renseigne = (valeur: unknown): boolean =>
  valeur != null &&
  valeur !== '' &&
  !(Array.isArray(valeur) && valeur.length === 0)

/** Chaque champ, avec une valeur plausible et l'endroit où elle doit arriver. */
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
    expect(renseigne(lu(fiche as Fiche))).toBe(true)
  })

  /**
   * L'autre sens : ce que le domaine refuserait, la saisie le refuse d'abord.
   * Sans cela, la valeur passerait la validation pour disparaître ensuite.
   */
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
