import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId, PerimetreDesStatistiques } from '../../../../domain'
import { PresenceDeCrasV1 } from '../../domain'

const presenceChez = async (
  mediateur: MediateurId,
): Promise<PresenceDeCrasV1> =>
  PresenceDeCrasV1(
    (await prismaClient.activite.findFirst({
      where: { mediateurId: mediateur, v1CraId: { not: null } },
      select: { id: true },
    })) === null
      ? 'Absents'
      : 'Presents',
  )

export const verifierLaPresenceDeCrasV1 = async (
  perimetre: PerimetreDesStatistiques,
): Promise<PresenceDeCrasV1> =>
  perimetre.type === 'Mediateur'
    ? presenceChez(perimetre.mediateur)
    : PresenceDeCrasV1('Presents')
