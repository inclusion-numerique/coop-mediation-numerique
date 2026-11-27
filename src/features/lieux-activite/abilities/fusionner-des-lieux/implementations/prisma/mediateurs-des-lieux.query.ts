import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { MediateursDesLieux } from '../../domain/ports'

const mediateurs = (
  rattachements: readonly { readonly mediateurId: string }[],
): readonly MediateurId[] =>
  rattachements.map(({ mediateurId }) => MediateurId(mediateurId))

export const mediateursDesLieux: MediateursDesLieux = async ({
  source,
  cible,
}) => {
  const [rattachesALaSource, enActiviteDansLaCible] = await Promise.all([
    prismaClient.mediateurEnActivite.findMany({
      where: { structureId: source, suppression: null },
      select: { mediateurId: true },
    }),
    prismaClient.mediateurEnActivite.findMany({
      where: { structureId: cible, suppression: null, fin: null },
      select: { mediateurId: true },
    }),
  ])

  return {
    rattachesALaSource: mediateurs(rattachesALaSource),
    enActiviteDansLaCible: mediateurs(enActiviteDansLaCible),
  }
}
