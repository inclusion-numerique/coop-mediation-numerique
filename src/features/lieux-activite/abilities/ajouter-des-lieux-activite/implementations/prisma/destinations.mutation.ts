import { v4 } from 'uuid'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import { releverLeLieu } from '../../../../implementations/prisma/lieu-correle.mutation'
import type { DestinationDuLieu } from '../../domain'

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

export const rattacherSiAbsent = async (
  transaction: Prisma.TransactionClient,
  {
    utilisateurId,
    lieuId,
    debut,
    creationParId,
    journaliser,
  }: {
    readonly utilisateurId: string
    readonly lieuId: LieuId
    readonly debut: Date
    readonly creationParId: string | null
    readonly journaliser: () => void
  },
): Promise<void> => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: {
      mediateur: { userId: utilisateurId },
      structureId: lieuId,
      suppression: null,
      fin: null,
    },
    select: { id: true },
  })

  if (dejaRattache) return

  journaliser()

  await transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId: utilisateurId } },
      lieuInclusion: { connect: { id: lieuId } },
      debut,
      ...(creationParId === null
        ? {}
        : { creationPar: { connect: { id: creationParId } } }),
    },
  })
}
