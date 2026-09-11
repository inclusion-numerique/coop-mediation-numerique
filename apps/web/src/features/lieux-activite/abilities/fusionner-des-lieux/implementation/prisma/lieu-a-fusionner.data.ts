import type { Prisma } from '@prisma/client'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementation/prisma/registre'

/**
 * Ce qu'il faut lire d'un lieu pour prévisualiser sa fusion.
 *
 * Les relations employeuse (emplois, activités employeur) vivent sur
 * `structure_administrative`, sans lien FK avec le lieu : elles ne s'obtiennent
 * pas par `include`. La fusion de deux lieux dont les employeuses corrélées
 * diffèrent reste ambiguë.
 *
 * Cet `include` et la ligne qu'il produit décrivent la base, pas le métier :
 * ils vivent avec la requête, jamais dans le domaine.
 */
export const lieuAFusionnerInclude = {
  // L'identité cartographique du lieu vit dans son inscription au registre de
  // l'Entrepôt : la prévisualisation la lit là, la coop n'en gardant plus copie.
  inscriptionRegistre: inscriptionPourLIdentifiantCarto,
  mediateursEnActivite: {
    where: { suppression: null },
    select: { mediateurId: true },
  },
  activites: {
    where: { suppression: null },
    select: { id: true },
  },
} satisfies Prisma.LieuInclusionInclude

export type LieuAFusionnerRow = Prisma.LieuInclusionGetPayload<{
  include: typeof lieuAFusionnerInclude
}>
