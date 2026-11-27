import {
  CodeInsee,
  CodePostal,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../domain/identifiants/lieu-id'
import type { LieuxAuMemeEndroit } from '../../domain/ports'

export const lieuxAuMemeEndroit: LieuxAuMemeEndroit = async ({
  codeInsee,
  codePostal,
}) =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: {
        banId: { not: null },
        OR: [{ codeInsee }, { codePostal }],
      },
      orderBy: { creation: 'asc' },
      select: {
        id: true,
        nom: true,
        adresse: true,
        latitude: true,
        longitude: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        suppression: true,
        typologies: true,
      },
    })
  ).map((candidat) => ({
    ...candidat,
    id: LieuId(candidat.id),
    codePostal: CodePostal.safe(candidat.codePostal),
    codeInsee:
      candidat.codeInsee === null ? null : CodeInsee.safe(candidat.codeInsee),
  }))
