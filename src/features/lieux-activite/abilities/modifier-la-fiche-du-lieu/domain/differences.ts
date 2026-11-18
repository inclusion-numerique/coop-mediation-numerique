import type { Fiche } from '../../../domain/fiche'
import type { SectionDeLaFiche } from './modification-lieu'

const CHAMPS = [
  { champ: 'nom', libelle: 'Nom', section: 'InformationsGenerales' },
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

export type OrigineDuChoix = 'coop' | 'registre'

export type ChoixDesDifferences = Readonly<
  Partial<Record<ChampCompare, OrigineDuChoix>>
>

export type Difference = {
  readonly champ: ChampCompare
  readonly libelle: string
  readonly section: SectionDeLaFiche
  readonly coop: Fiche[ChampCompare]
  readonly registre: Fiche[ChampCompare]
}

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

export const sectionsConcernees = (
  ecarts: readonly Difference[],
): readonly SectionDeLaFiche[] => [
  ...new Set(ecarts.map(({ section }) => section)),
]
