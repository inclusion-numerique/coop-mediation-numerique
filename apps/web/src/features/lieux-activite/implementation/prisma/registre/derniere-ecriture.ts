import type { Prisma } from '@prisma/client'
import type { InscriptionPourLaFiche } from './fiche-du-registre'

/**
 * Les trois horodatages de source du registre. `updated_at` les résume en base
 * (`GREATEST(...)`) mais c'est une colonne générée, que Prisma ne sait pas
 * décrire : la récence se dérive donc des trois, en code.
 */
export type HorodatagesDeSource = Pick<
  InscriptionPourLaFiche,
  'updatedAtCarto' | 'updatedAtCoop' | 'updatedAtMin'
>

/**
 * Quand ce lieu a bougé pour la dernière fois, quelle que soit la main qui a
 * écrit.
 *
 * La date de la coop ne suffit plus depuis que la fiche rendue vient du
 * registre : une valeur reprise par `dora` change ce qu'on publie sans bouger
 * `coop.lieu_inclusion.modification`. Un client qui tient un miroir daterait
 * alors sa copie d'un instant où elle était déjà fausse.
 */
export const derniereEcriture = (
  inscription: HorodatagesDeSource | null,
  modificationCoop: Date,
): Date =>
  [
    inscription?.updatedAtCarto,
    inscription?.updatedAtCoop,
    inscription?.updatedAtMin,
  ]
    .filter((date): date is Date => date != null)
    .reduce((plus, date) => (date > plus ? date : plus), modificationCoop)

/**
 * Le filtre qui va avec, et qui doit regarder les mêmes colonnes : un lieu
 * écarté par le filtre alors que `derniereEcriture` le dit récent serait perdu
 * pour toujours par une synchronisation incrémentale — elle ne redemande
 * jamais ce qu'elle croit à jour.
 */
export const aBougeDepuis = (depuis: Date) =>
  ({
    OR: [
      { modification: { gte: depuis } },
      { inscriptionRegistre: { updatedAtCarto: { gte: depuis } } },
      { inscriptionRegistre: { updatedAtCoop: { gte: depuis } } },
      { inscriptionRegistre: { updatedAtMin: { gte: depuis } } },
    ],
  }) satisfies Prisma.LieuInclusionWhereInput
