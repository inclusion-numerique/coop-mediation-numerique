import {
  inscriptionPourLIdentifiantCarto,
  lieuCoopToDomain,
  lieuFromDomain,
  lieuVersRegistre,
} from '@app/web/features/lieux-activite/implementation'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Les colonnes de vocabulaire, du côté coop et du côté registre.
 *
 * Elles portent le même nom des deux côtés, ce qui n'est pas un hasard : le
 * registre reprend la nomenclature de la coop, et la garde d'alignement le
 * prouve au compilateur.
 */
const LISTES = [
  'typologies',
  'services',
  'modalitesAcces',
  'modalitesAccompagnement',
  'publicsSpecifiquementAdresses',
  'priseEnChargeSpecifique',
  'fraisACharge',
  'itinerance',
  'dispositifProgrammesNationaux',
  'formationsLabels',
  'autresFormationsLabels',
] as const

const retenues = <T extends object>(
  colonnes: T,
  champs: readonly string[],
): Partial<T> =>
  Object.fromEntries(
    Object.entries(colonnes).filter(([champ]) => champs.includes(champ)),
  ) as Partial<T>

/**
 * Réécrit les listes d'un lieu, triées, dans la coop ET au registre.
 *
 * L'écriture ne passe PAS par `ecrireAuRegistre` : sa signature pose
 * `source = 'Coop numérique'` et `deletedAt = null`, ce qui convient à une
 * édition — quelqu'un tient la fiche à jour — mais pas à une reprise. 4 513
 * lignes du registre ont un autre producteur que la coop ; leur faire
 * revendiquer sa paternité pour un tri serait faux.
 *
 * Rien n'est horodaté non plus. L'ordre d'une liste ne porte aucune
 * information : le changer n'en est pas un, et le signaler par une date de
 * mise à jour fabriquerait le faux changement que ce tri vient supprimer.
 *
 * `modification` est donc réécrite à sa propre valeur. Ce n'est pas une
 * précaution inutile : une extension du client horodate chaque `update` de
 * lieu, sauf quand l'appelant pose le champ lui-même. C'est la porte qu'elle
 * laisse, et celle qu'emprunte déjà la fusion de bénéficiaires.
 */
export const trierLesListes = async (
  lieuId: string,
  champs: readonly string[],
): Promise<void> => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  if (ligne == null) return

  const lieu = lieuCoopToDomain(ligne)
  const aEcrire = LISTES.filter((liste) => champs.includes(liste))

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        ...retenues(lieuFromDomain(lieu), aEcrire),
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: retenues(lieuVersRegistre(lieu), aEcrire),
    })
  })
}
