import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

/**
 * Les identifiants de cartographie que le registre porte, par lieu coop.
 *
 * La coop en tenait une copie, `coop.lieu_inclusion.id_cartographie_nationale`,
 * posée par le job de réconciliation. Les deux ont dérivé, dans les deux sens :
 * sur 12 764 lieux appariés, 561 ne s'accordaient plus — tantôt le registre
 * portait des tokens que la coop ignorait, tantôt l'inverse, et rien n'arbitrait.
 * L'identifiant appartient à la cartographie nationale et le registre en est le
 * domicile : la coop le lit désormais plutôt que d'en garder un double.
 *
 * Requête à part plutôt que jointure : aucune relation ne relie les deux
 * schémas, et en déclarer une exigerait une clé étrangère sur une table de
 * l'Entrepôt, qui ne nous appartient pas. C'est une lecture indexée sur
 * `structure_coop_id`, unique, faite une fois par page — jamais une par ligne.
 */
const identifiantsParLieu = async (
  lieuIds: readonly string[],
): Promise<ReadonlyMap<string, string>> => {
  if (lieuIds.length === 0) return new Map()

  const inscriptions = await prismaClient.lieuInclusionRegistreMain.findMany({
    where: {
      structureCoopId: { in: [...lieuIds] },
      structureCartographieNationaleId: { not: null },
    },
    select: { structureCoopId: true, structureCartographieNationaleId: true },
  })

  return new Map(
    inscriptions.flatMap(
      ({ structureCoopId, structureCartographieNationaleId }) =>
        structureCoopId == null || structureCartographieNationaleId == null
          ? []
          : [[structureCoopId, structureCartographieNationaleId] as const],
    ),
  )
}

/**
 * Greffe sur des lieux déjà lus l'identifiant de cartographie du registre.
 *
 * Les projections gardent le nom de colonne que la coop employait, de sorte que
 * rien ne change en aval : ce qui bouge est l'endroit d'où vient la valeur, pas
 * ce que les écrans en font.
 */
export const avecIdentifiantCarto = async <T extends { readonly id: string }>(
  lieux: readonly T[],
): Promise<
  (T & { readonly structureCartographieNationaleId: string | null })[]
> => {
  const identifiants = await identifiantsParLieu(lieux.map(({ id }) => id))

  return lieux.map((lieu) => ({
    ...lieu,
    structureCartographieNationaleId: identifiants.get(lieu.id) ?? null,
  }))
}

/**
 * Le lieu coop que le registre désigne sous cet identifiant de cartographie.
 *
 * L'identifiant est UNIQUE côté registre, là où la colonne coop ne l'était pas :
 * « quel lieu porte cet identifiant » y a une réponse et une seule, sans avoir à
 * départager par ancienneté comme le faisait la sonde qui interrogeait la coop.
 *
 * Rend `null` si personne ne le porte, si l'inscription n'est reliée à aucun
 * lieu coop, ou si le lieu qu'elle désigne a été supprimé depuis.
 */
export const lieuCoopPorteurDeLaCarto = async (
  transaction: Prisma.TransactionClient,
  identifiant: string,
): Promise<{ readonly id: string } | null> => {
  const inscription = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCartographieNationaleId: identifiant },
    select: { structureCoopId: true },
  })

  if (inscription?.structureCoopId == null) return null

  return transaction.lieuInclusion.findFirst({
    where: { id: inscription.structureCoopId, suppression: null },
    select: { id: true },
  })
}
