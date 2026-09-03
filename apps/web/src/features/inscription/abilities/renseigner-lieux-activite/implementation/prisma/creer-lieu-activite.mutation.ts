import { lieuCorrele, preparerCorrele } from '@app/web/features/lieux-activite'
import { lieuInclusionDepuisSaisie } from '@app/web/features/structures/lieuInclusionDepuisSaisie'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { CreerLieuActivite } from '../../domain'

/**
 * Crée le lieu saisi et y rattache le médiateur — sauf si la coop connaît déjà
 * cet établissement.
 *
 * On n'arrive sur ce formulaire qu'après une recherche restée sans résultat,
 * mais cette garde est un choix de l'écran : rien n'empêche d'y venir
 * directement, ni d'y ressaisir un lieu que la recherche n'avait pas su rendre
 * (une dénomination différente suffit). La sonde de corrélation reste donc le
 * dernier rempart, exactement comme pour les lieux rattachés depuis la
 * recherche — sans quoi ce parcours serait le moyen le plus simple de créer un
 * doublon.
 *
 * Le rattachement est idempotent : le médiateur n'exerce pas deux fois dans le
 * même lieu.
 */
export const creerLieuActivite: CreerLieuActivite = async ({
  userId,
  mediateurId,
  saisie,
}) =>
  prismaClient.$transaction(async (transaction) => {
    const donnees = lieuInclusionDepuisSaisie(saisie)

    const correle = await lieuCorrele(transaction, donnees)
    const prepare = correle && (await preparerCorrele(transaction, correle))

    const { id: structureId } =
      prepare ??
      (await transaction.lieuInclusion.create({
        data: { id: v4(), ...donnees, creationParId: userId },
        select: { id: true },
      }))

    const dejaRattache = await transaction.mediateurEnActivite.findFirst({
      where: { mediateurId, structureId, suppression: null, fin: null },
      select: { id: true },
    })

    if (dejaRattache) return { id: structureId }

    await transaction.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateurId,
        structureId,
        debut: new Date(),
        creationParId: userId,
      },
    })

    return { id: structureId }
  })
