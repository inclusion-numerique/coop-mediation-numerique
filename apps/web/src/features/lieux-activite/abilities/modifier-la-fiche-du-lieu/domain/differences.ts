import type { Fiche } from '../../../domain/fiche'
import type { SectionDeLaFiche } from './modification-lieu'

/**
 * Les champs que la coop sait écrire, et qu'un producteur tiers peut donc lui
 * avoir repris.
 *
 * N'y figurent pas :
 *
 * - `pivot` et `localisation`, que le registre ne porte pas — les deux fiches
 *   les tiennent de la coop et ne peuvent pas en différer ;
 * - `dispositifProgrammesNationaux` et `autresFormationsLabels`, qu'aucun
 *   formulaire de la coop ne renseigne. Les proposer au choix reviendrait à
 *   offrir d'effacer ce que la coop n'a jamais su dire.
 */
const CHAMPS = [
  { champ: 'nom', libelle: 'Nom', section: 'InformationsGenerales' },
  { champ: 'adresse', libelle: 'Adresse', section: 'InformationsGenerales' },
  {
    champ: 'typologies',
    libelle: 'Typologies',
    section: 'InformationsGenerales',
  },
  {
    champ: 'itinerance',
    libelle: 'Itinérance',
    section: 'InformationsGenerales',
  },
  { champ: 'contact', libelle: 'Contact', section: 'InformationsPratiques' },
  { champ: 'horaires', libelle: 'Horaires', section: 'InformationsPratiques' },
  {
    champ: 'ficheAccesLibre',
    libelle: 'Fiche accès libre',
    section: 'InformationsPratiques',
  },
  {
    champ: 'priseRdv',
    libelle: 'Prise de rendez-vous',
    section: 'InformationsPratiques',
  },
  { champ: 'presentation', libelle: 'Présentation', section: 'Description' },
  {
    champ: 'formationsLabels',
    libelle: 'Formations et labels',
    section: 'Description',
  },
  {
    champ: 'services',
    libelle: 'Services',
    section: 'ServicesEtAccompagnement',
  },
  {
    champ: 'modalitesAccompagnement',
    libelle: 'Modalités d’accompagnement',
    section: 'ServicesEtAccompagnement',
  },
  {
    champ: 'modalitesAcces',
    libelle: 'Modalités d’accès',
    section: 'ModalitesAccesAuService',
  },
  {
    champ: 'fraisACharge',
    libelle: 'Frais à charge',
    section: 'ModalitesAccesAuService',
  },
  {
    champ: 'publicsSpecifiquementAdresses',
    libelle: 'Publics spécifiquement adressés',
    section: 'TypesDePublicsAccueillis',
  },
  {
    champ: 'priseEnChargeSpecifique',
    libelle: 'Prise en charge spécifique',
    section: 'TypesDePublicsAccueillis',
  },
] as const satisfies readonly {
  champ: keyof Fiche
  libelle: string
  section: SectionDeLaFiche
}[]

export type ChampCompare = (typeof CHAMPS)[number]['champ']

/** De quel côté le médiateur prend la valeur, pour un champ donné. */
export type OrigineDuChoix = 'coop' | 'registre'

export type Difference = {
  readonly champ: ChampCompare
  readonly libelle: string
  readonly section: SectionDeLaFiche
  readonly coop: Fiche[ChampCompare]
  readonly registre: Fiche[ChampCompare]
}

/**
 * Deux valeurs disent-elles la même chose ?
 *
 * La comparaison est structurelle et non référentielle : les valeurs viennent
 * de deux lectures distinctes, aucune n'est jamais le même objet que l'autre.
 * L'ordre d'un tableau ne compte pas — la coop et le registre ne rangent pas
 * forcément les services pareil, et y voir une divergence ferait clignoter des
 * fiches identiques.
 */
const memeValeur = (une: unknown, autre: unknown): boolean => {
  if (Array.isArray(une) && Array.isArray(autre)) {
    const rangee = [...autre].sort()

    return (
      une.length === autre.length &&
      [...une].sort().every((valeur, index) => valeur === rangee[index])
    )
  }

  if (une == null || autre == null) return une == null && autre == null

  if (typeof une === 'object' && typeof autre === 'object')
    return JSON.stringify(trie(une)) === JSON.stringify(trie(autre))

  return une === autre
}

/** Les clés d'un objet rangées, pour que `JSON.stringify` soit comparable. */
const trie = (valeur: object): unknown =>
  Object.fromEntries(
    Object.entries(valeur)
      .filter(([, contenu]) => contenu != null)
      .sort(([une], [autre]) => une.localeCompare(autre))
      .map(([clef, contenu]) => [
        clef,
        contenu != null &&
        typeof contenu === 'object' &&
        !Array.isArray(contenu)
          ? trie(contenu)
          : contenu,
      ]),
  )

/**
 * Ce qui a changé entre la fiche que la coop a enregistrée et celle que le
 * registre montre.
 *
 * Une information effacée est une différence comme une autre : le registre qui
 * ne dit plus rien d'un champ que la coop renseignait est un écart, et
 * l'absence se présente au choix au même titre qu'une valeur.
 */
export const differences = (
  coop: Fiche,
  registre: Fiche,
): readonly Difference[] =>
  CHAMPS.filter(({ champ }) => !memeValeur(coop[champ], registre[champ])).map(
    ({ champ, libelle, section }) => ({
      champ,
      libelle,
      section,
      coop: coop[champ],
      registre: registre[champ],
    }),
  )
