import { dateAsDayConventional } from '@/libraries/date/date-as-day'
import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { filtreDePeriode } from '@/libraries/etat-d-url/definition/filtre-de-periode'
import { numberToString } from '@/libraries/nombre/format-number'

export type PeriodeChoisie = {
  readonly du?: string
  readonly au?: string
}

const filtresDeLaPeriode = composerLEtat(filtreDePeriode)

const jour = (date: Date | null): string | undefined =>
  date?.toISOString().slice(0, 10)

const enDate = (jourChoisi: string | undefined): Date | null =>
  jourChoisi === undefined ? null : new Date(jourChoisi)

export const periodeChoisieDans = (
  parametres: Readonly<Record<string, string | readonly string[] | undefined>>,
): PeriodeChoisie => {
  const { du, au } = filtresDeLaPeriode.charger(parametres)
  return Object.fromEntries(
    Object.entries({ du: jour(du), au: jour(au) }).filter(
      ([, valeur]) => valeur !== undefined,
    ),
  )
}

export const periodeDActivite = (
  premiere: string | null,
  derniere: string | null,
): string =>
  premiere === null || derniere === null
    ? 'Aucune activité enregistrée'
    : `Du ${dateAsDayConventional(new Date(premiere))} au ${dateAsDayConventional(new Date(derniere))}`

export const adresseDExport = (
  chemin: string,
  { du, au }: PeriodeChoisie,
): string =>
  filtresDeLaPeriode.adresse(
    { chemin, parametres: {} },
    { du: enDate(du), au: enDate(au) },
  )

export const titreDesStatistiques = ({
  coordinateur,
}: {
  readonly coordinateur: boolean
}): string => (coordinateur ? 'Statistiques, équipe comprise' : 'Statistiques')

export const adressesDesExports = (utilisateurId: string) => ({
  statistiques: `/administration/utilisateurs/${utilisateurId}/export/statistiques`,
  accompagnements: `/administration/utilisateurs/${utilisateurId}/export/accompagnements`,
})

export const debutDuFiltreDePeriode = (
  premiere: string | null,
): Date | undefined => (premiere === null ? undefined : new Date(premiere))

type Part = {
  readonly label: string
  readonly count: number
  readonly proportion: number
}

type Total = { readonly total: number; readonly proportion: number }

export type StatistiquesBrutes = {
  readonly totaux: {
    readonly activites: {
      readonly total: number
      readonly individuels: Total
      readonly collectifs: Total & { readonly participants: number }
    }
    readonly accompagnements: {
      readonly total: number
      readonly individuels: Total
      readonly collectifs: Total
    }
    readonly beneficiaires: {
      readonly total: number
      readonly nouveaux: number
      readonly suivis: number
      readonly anonymes: number
    }
  }
  readonly repartition: {
    readonly typeActivites: readonly Part[]
    readonly durees: readonly Part[]
    readonly typeLieu: readonly Part[]
    readonly thematiques: readonly Part[]
    readonly thematiquesDemarches: readonly Part[]
    readonly materiels: readonly Part[]
  }
  readonly profil: {
    readonly genres: readonly Part[]
    readonly trancheAges: readonly Part[]
    readonly statutsSocial: readonly Part[]
  }
  readonly lieux: readonly Part[]
  readonly coordination:
    | readonly {
        readonly libelle: string
        readonly nombre: number
      }[]
    | null
}

type Ligne = { readonly libelle: string; readonly valeur: string }

export type GroupeDeStatistiques = {
  readonly titre: string
  readonly lignes: readonly Ligne[]
}

const nombre = (valeur: number): string => numberToString(valeur)

const avecSaPart = ({ total, proportion }: Total): string =>
  `${nombre(total)} (${nombre(Math.round(proportion))} %)`

const ligneDeLaPart = ({ label, count, proportion }: Part): Ligne => ({
  libelle: label,
  valeur: avecSaPart({ total: count, proportion }),
})

const AUCUNE: readonly Ligne[] = [{ libelle: 'Aucune', valeur: '0' }]

const auMoinsUneLigne = (lignes: readonly Ligne[]): readonly Ligne[] =>
  lignes.length === 0 ? AUCUNE : lignes

const groupe = (
  titre: string,
  parts: readonly Part[],
): GroupeDeStatistiques => ({
  titre,
  lignes: auMoinsUneLigne(parts.map(ligneDeLaPart)),
})

const groupeTrie = (
  titre: string,
  parts: readonly Part[],
): GroupeDeStatistiques =>
  groupe(
    titre,
    parts
      .filter(({ count }) => count > 0)
      .toSorted((une, autre) => autre.count - une.count),
  )

const nouveaux = (valeur: number, { du, au }: PeriodeChoisie): string =>
  du === undefined || au === undefined
    ? 'Sur une période choisie seulement'
    : nombre(valeur)

export const groupesDesStatistiques = ({
  totaux: { activites, accompagnements, beneficiaires },
  repartition,
  profil,
  lieux,
  coordination,
  periode,
}: StatistiquesBrutes & {
  readonly periode: PeriodeChoisie
}): readonly GroupeDeStatistiques[] => [
  {
    titre: 'Activités',
    lignes: [
      { libelle: 'Total', valeur: nombre(activites.total) },
      { libelle: 'Individuelles', valeur: avecSaPart(activites.individuels) },
      {
        libelle: 'Collectives (ateliers)',
        valeur: avecSaPart(activites.collectifs),
      },
      {
        libelle: 'Participants aux ateliers',
        valeur: nombre(activites.collectifs.participants),
      },
    ],
  },
  {
    titre: 'Accompagnements',
    lignes: [
      { libelle: 'Total', valeur: nombre(accompagnements.total) },
      {
        libelle: 'Individuels',
        valeur: avecSaPart(accompagnements.individuels),
      },
      { libelle: 'Collectifs', valeur: avecSaPart(accompagnements.collectifs) },
    ],
  },
  {
    titre: 'Bénéficiaires',
    lignes: [
      { libelle: 'Total', valeur: nombre(beneficiaires.total) },
      { libelle: 'Suivis', valeur: nombre(beneficiaires.suivis) },
      { libelle: 'Anonymes', valeur: nombre(beneficiaires.anonymes) },
      {
        libelle: 'Nouveaux',
        valeur: nouveaux(beneficiaires.nouveaux, periode),
      },
    ],
  },
  groupe('Types d’activité', repartition.typeActivites),
  groupe('Durées des accompagnements', repartition.durees),
  groupe('Types de lieu', repartition.typeLieu),
  groupe('Matériel utilisé', repartition.materiels),
  groupeTrie('Thématiques', repartition.thematiques),
  groupeTrie('Démarches administratives', repartition.thematiquesDemarches),
  groupe('Genre des bénéficiaires', profil.genres),
  groupe('Tranche d’âge des bénéficiaires', profil.trancheAges),
  groupe('Statut social des bénéficiaires', profil.statutsSocial),
  groupeTrie('Lieux d’activité', lieux),
  ...(coordination === null
    ? []
    : [
        {
          titre: 'Activités de coordination, sur toute la période d’activité',
          lignes: auMoinsUneLigne(
            coordination.map(({ libelle, nombre: valeur }) => ({
              libelle,
              valeur: nombre(valeur),
            })),
          ),
        },
      ]),
]
