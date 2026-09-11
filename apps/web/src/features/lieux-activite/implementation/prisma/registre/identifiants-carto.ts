import type { Prisma } from '@prisma/client'

/**
 * L'identité cartographique d'un lieu se lit dans son inscription au registre de
 * l'Entrepôt, dont c'est le domicile. La coop en tenait une copie, posée par le
 * job de réconciliation, et les deux ont dérivé : sur 12 764 lieux appariés, 561
 * ne s'accordaient plus — tantôt le registre portait des tokens que la coop
 * ignorait, tantôt l'inverse, et rien n'arbitrait.
 *
 * La lecture passe par une jointure et non par une seconde requête. Le lien qui
 * la porte est `structure_coop_id`, du côté du registre : la coop n'en tient pas
 * de copie, et aucune contrainte ne traverse les deux schémas — `main` appartient
 * au Dataspace, qui doit pouvoir remodeler ses tables sans nous.
 */

/** À inclure dans un `select` de lieu pour en obtenir l'identité cartographique. */
export const inscriptionPourLIdentifiantCarto = {
  select: { structureCartographieNationaleId: true },
}

type AvecInscription = {
  readonly inscriptionRegistre: {
    readonly structureCartographieNationaleId: string | null
  } | null
}

/**
 * Aplatit l'inscription incluse en l'identifiant que les écrans attendent.
 *
 * Les projections gardent le nom de colonne que la coop employait : ce qui a
 * changé est la provenance de la valeur, pas ce qu'on en fait.
 */
export const avecIdentifiantCarto = <T extends AvecInscription>(
  lieu: T,
): Omit<T, 'inscriptionRegistre'> & {
  readonly structureCartographieNationaleId: string | null
} => {
  // Le paramètre n'est PAS déstructuré dans la signature : TypeScript y perdrait
  // l'inférence et rabattrait `T` sur sa contrainte, si bien que tous les champs
  // du lieu disparaîtraient du type de retour.
  const { inscriptionRegistre, ...reste } = lieu

  return {
    ...reste,
    structureCartographieNationaleId:
      inscriptionRegistre?.structureCartographieNationaleId ?? null,
  }
}

/**
 * Le lieu coop que le registre désigne sous cet identifiant de cartographie.
 *
 * L'identifiant est UNIQUE côté registre, là où la colonne coop ne l'était pas :
 * « quel lieu porte cet identifiant » y a une réponse et une seule, sans avoir à
 * départager par ancienneté comme le faisait la sonde qui interrogeait la coop.
 */
export const lieuCoopPorteurDeLaCarto = async (
  transaction: Prisma.TransactionClient,
  identifiant: string,
): Promise<{ readonly id: string } | null> =>
  transaction.lieuInclusion.findFirst({
    where: {
      suppression: null,
      inscriptionRegistre: { structureCartographieNationaleId: identifiant },
    },
    select: { id: true },
  })
