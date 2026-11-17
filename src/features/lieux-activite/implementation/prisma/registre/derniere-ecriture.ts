import type { Prisma } from '@app/web/generated/prisma/client'
import type { InscriptionPourLaFiche } from './fiche-du-registre'

export type HorodatagesDeSource = Pick<
  InscriptionPourLaFiche,
  'updatedAtCarto' | 'updatedAtCoop' | 'updatedAtMin'
>

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

export const aBougeDepuis = (depuis: Date) =>
  ({
    OR: [
      { modification: { gte: depuis } },
      { inscriptionRegistre: { updatedAtCarto: { gte: depuis } } },
      { inscriptionRegistre: { updatedAtCoop: { gte: depuis } } },
      { inscriptionRegistre: { updatedAtMin: { gte: depuis } } },
    ],
  }) satisfies Prisma.LieuInclusionWhereInput
