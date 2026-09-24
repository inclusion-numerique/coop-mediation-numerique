import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { AdresseGeocodee } from '../domain/adresse-a-reprendre'
import type { ReprendreLAdresse } from '../domain/reprise-de-l-adresse'

/**
 * L'identifiant de la `main.adresse` où pointer le lieu, en la créant au besoin.
 *
 * La fonction appartient à l'équipe qui possède le schéma. L'employer plutôt que
 * de refaire son travail est la seule façon d'écrire les adresses sous la même
 * forme qu'eux — et de ne pas semer de doublons dans une table mutualisée entre
 * les lieux et les structures administratives. Elle cherche d'abord par clef
 * d'interopérabilité, puis par clé naturelle, et reprend la main si un insert
 * concurrent lui grille la place.
 */
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
