import type { Prisma } from '@/generated/prisma/client'
import type { DestinationDuLieu } from '../../domain/destination-du-lieu'
import type { LieuId } from '../../domain/identifiants/lieu-id'
import { depublierAuRegistre } from './registre/depublier-au-registre.mutation'

const releverLeLieu = async (
  transaction: Prisma.TransactionClient,
  lieuId: LieuId,
  maintenant: Date,
): Promise<void> => {
  const releve = await transaction.lieuInclusion.update({
    where: { id: lieuId },
    data: {
      suppression: null,
      suppressionParId: null,
      visiblePourCartographieNationale: false,
      derniereModificationSource: null,
    },
    select: { id: true },
  })

  await depublierAuRegistre(transaction, { lieuId: releve.id, maintenant })
}

const estAVerifier = <Creation>(
  destination: DestinationDuLieu<Creation>,
): boolean =>
  destination._tag === 'LieuActif' || destination._tag === 'LieuARelever'

export const lieuDisparu = async <Creation>(
  transaction: Prisma.TransactionClient,
  destinations: readonly DestinationDuLieu<Creation>[],
): Promise<LieuId | null> => {
  const aVerifier = destinations.filter(estAVerifier)

  const presents = await transaction.lieuInclusion.findMany({
    where: { id: { in: aVerifier.map(({ id }) => id) } },
    select: { id: true, suppression: true },
  })

  const toujoursLa = ({ _tag, id }: DestinationDuLieu<Creation>): boolean =>
    presents.some(
      (present) =>
        present.id === id &&
        (_tag === 'LieuARelever' || present.suppression === null),
    )

  return aVerifier.find((destination) => !toujoursLa(destination))?.id ?? null
}

export const preparerLeLieu = async <Creation>(
  transaction: Prisma.TransactionClient,
  destination: DestinationDuLieu<Creation>,
  {
    maintenant,
    creer,
  }: {
    readonly maintenant: Date
    readonly creer: (
      id: LieuId,
      creation: Creation,
    ) => Promise<{ readonly id: string }>
  },
): Promise<void> => {
  if (destination._tag === 'LieuARelever')
    await releverLeLieu(transaction, destination.id, maintenant)

  if (destination._tag === 'LieuACreer')
    await creer(destination.id, destination.creation)
}
