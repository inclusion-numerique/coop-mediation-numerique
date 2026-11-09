import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { AdresseGeocodee } from '../domain/adresse-a-reprendre'
import type { ReprendreLAdresse } from '../domain/reprise-de-l-adresse'

const adresseDuRegistre = async (
  transaction: Prisma.TransactionClient,
  adresse: AdresseGeocodee,
): Promise<number | null> => {
  const [resolue] = await transaction.$queryRaw<{ id: number | null }[]>`
    SELECT main.trouver_ou_creer_adresse_lieu(
      ${adresse.voie}::text,
      ${adresse.codePostal}::text,
      ${adresse.commune}::text,
      ${adresse.codeInsee}::text,
      ${adresse.latitude}::float8,
      ${adresse.longitude}::float8,
      ${adresse.banId}::text
    ) AS id`

  return resolue?.id ?? null
}

export const reprendreLAdresse: ReprendreLAdresse = async (
  lieuId,
  adresse,
  complement,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        adresse: adresse.voie,
        commune: adresse.commune,
        codePostal: adresse.codePostal,
        codeInsee: adresse.codeInsee,
        banId: adresse.banId,
        latitude: adresse.latitude,
        longitude: adresse.longitude,
        ...(complement == null ? {} : { complementAdresse: complement }),
        modification: ligne.modification,
      },
    })

    const adresseId = await adresseDuRegistre(transaction, adresse)

    if (adresseId == null && complement == null) return

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: {
        ...(adresseId == null ? {} : { adresseId }),
        ...(complement == null ? {} : { complementAdresse: complement }),
      },
    })
  })
}
