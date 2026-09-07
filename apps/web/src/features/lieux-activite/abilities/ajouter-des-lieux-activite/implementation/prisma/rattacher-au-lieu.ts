import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import {
  fromAdresse,
  lieuFromDomain,
} from '../../../../implementation/prisma/lieu.transfer'
import {
  lieuCorrele,
  preparerCorrele,
} from '../../../../implementation/prisma/lieu-correle'
import {
  type AdresseValidee,
  estExistant,
  type LieuACreer,
  type LieuCarto,
  type LieuDemande,
  lieuDepuisCarto,
} from '../../domain'

const adresseValidee = ({ adresse, localisation, banId }: AdresseValidee) => ({
  ...fromAdresse(adresse),
  banId,
  latitude: localisation.latitude,
  longitude: localisation.longitude,
})

const lieuDepuisAdresse = (lieu: LieuACreer) => ({
  id: v4(),
  nom: lieu.nom,
  siret: lieu.siret ?? null,
  ...adresseValidee(lieu),
})

const materialiser = async (
  transaction: Prisma.TransactionClient,
  donnees: Parameters<typeof lieuCorrele>[1] &
    Prisma.LieuInclusionCreateManyInput,
): Promise<{ readonly id: string }> => {
  const correle = await lieuCorrele(transaction, donnees)
  const prepare = correle && (await preparerCorrele(transaction, correle))

  if (prepare) return prepare

  return transaction.lieuInclusion.create({
    data: donnees,
    select: { id: true },
  })
}

const lieuARattacher = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuDemande,
  structuresCartoParId: ReadonlyMap<string, LieuCarto>,
  maintenant: Date,
): Promise<{ readonly id: string }> => {
  const designe = estExistant(lieu)
    ? await transaction.lieuInclusion.findFirst({
        where: { id: lieu.id, suppression: null },
        select: { id: true },
      })
    : null

  if (designe) return designe

  const porteurDeLaCarto = lieu.structureCartographieNationaleId
    ? await transaction.lieuInclusion.findFirst({
        where: {
          structureCartographieNationaleId:
            lieu.structureCartographieNationaleId,
          suppression: null,
        },
        orderBy: { creation: 'asc' },
        select: { id: true },
      })
    : null

  if (porteurDeLaCarto) return porteurDeLaCarto

  if (estExistant(lieu))
    throw new Error(
      `Le lieu ${lieu.id} n'existe plus et ne peut pas être recréé : son adresse n'a pas été validée`,
    )

  const lieuCarto = lieu.structureCartographieNationaleId
    ? structuresCartoParId.get(lieu.structureCartographieNationaleId)
    : undefined

  return materialiser(
    transaction,
    lieuCarto
      ? {
          ...lieuFromDomain(lieuDepuisCarto(lieuCarto, maintenant)),
          ...adresseValidee(lieu),
        }
      : lieuDepuisAdresse(lieu),
  )
}

export const rattacherAuLieu = async (
  transaction: Prisma.TransactionClient,
  {
    userId,
    lieu,
    structuresCartoParId,
    maintenant,
  }: {
    readonly userId: string
    readonly lieu: LieuDemande
    readonly structuresCartoParId: ReadonlyMap<string, LieuCarto>
    readonly maintenant: Date
  },
) => {
  const { id: structureId } = await lieuARattacher(
    transaction,
    lieu,
    structuresCartoParId,
    maintenant,
  )

  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: {
      mediateur: { userId },
      structureId,
      suppression: null,
      fin: null,
    },
    select: { id: true },
  })

  if (dejaRattache) return { lieuId: structureId }

  await transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId } },
      lieuInclusion: { connect: { id: structureId } },
      debut: maintenant,
      creationPar: { connect: { id: userId } },
    },
  })

  return { lieuId: structureId }
}
