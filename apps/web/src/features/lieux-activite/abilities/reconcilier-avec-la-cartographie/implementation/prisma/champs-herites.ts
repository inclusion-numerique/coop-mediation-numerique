import type { Prisma } from '@prisma/client'

type Transaction = Prisma.TransactionClient

/**
 * Ce qu'un lieu absorbé lègue à celui qui survit : sa visibilité, son référent
 * et ses identifiants v1. La visibilité se propage dès qu'un seul des fusionnés
 * était publié — dépublier un lieu par le seul effet d'une fusion le ferait
 * disparaître de la carte sans que personne ne l'ait décidé.
 */
const heritage = {
  visiblePourCartographieNationale: true,
  nomReferent: true,
  courrielReferent: true,
  telephoneReferent: true,
  v1Imported: true,
  v1StructureId: true,
  v1StructureIdPg: true,
  v1PermanenceId: true,
} satisfies Prisma.LieuInclusionSelect

export type Heritage = Prisma.LieuInclusionGetPayload<{
  select: typeof heritage
}>

const plusRecentNonVide = <Champ extends keyof Heritage>(
  lieux: readonly Heritage[],
  champ: Champ,
): Heritage[Champ] | null =>
  lieux.find((lieu) => lieu[champ] != null)?.[champ] ?? null

/**
 * Les champs énumérés un par un plutôt que dérivés d'une liste de clés : la
 * forme dérivée demanderait un `as` pour se convaincre du résultat, et une
 * seconde liste à tenir en phase avec le type.
 */
export const champsHerites = async (
  transaction: Transaction,
  ids: readonly string[],
): Promise<Heritage> => {
  // Du plus récemment modifié au plus ancien : le premier à renseigner un champ
  // le lègue.
  const lieux = await transaction.lieuInclusion.findMany({
    where: { id: { in: [...ids] } },
    select: heritage,
    orderBy: { modification: 'desc' },
  })

  return {
    visiblePourCartographieNationale: lieux.some(
      ({ visiblePourCartographieNationale }) =>
        visiblePourCartographieNationale,
    ),
    nomReferent: plusRecentNonVide(lieux, 'nomReferent'),
    courrielReferent: plusRecentNonVide(lieux, 'courrielReferent'),
    telephoneReferent: plusRecentNonVide(lieux, 'telephoneReferent'),
    v1Imported: plusRecentNonVide(lieux, 'v1Imported'),
    v1StructureId: plusRecentNonVide(lieux, 'v1StructureId'),
    v1StructureIdPg: plusRecentNonVide(lieux, 'v1StructureIdPg'),
    v1PermanenceId: plusRecentNonVide(lieux, 'v1PermanenceId'),
  }
}
