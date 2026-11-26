import { prismaClient } from '@/configuration/prisma'
import {
  CoordinateurId,
  jalon,
  MediateurId,
  nomAffiche,
  OrigineCompte,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'
import { roleLu } from '../../../../implementations/prisma/role.transfer'
import type { CibleUsurpation, CompteDeTest } from '../../domain'

export const cibleUsurpation = async (
  id: UtilisateurId,
): Promise<CibleUsurpation | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id, deleted: null },
    select: {
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      role: true,
      isFixture: true,
      inscriptionValidee: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return row === null
    ? null
    : {
        id,
        nom: nomAffiche(identiteToDomain(row)),
        origine: OrigineCompte(row.isFixture ? 'Fixture' : 'Reel'),
        role: roleLu(row.role),
        inscription: jalon(row.inscriptionValidee),
        rattachements: rattachements(
          row.mediateur === null ? null : MediateurId(row.mediateur.id),
          row.coordinateur === null
            ? null
            : CoordinateurId(row.coordinateur.id),
        ),
      }
}

export const comptesDeTest = async (): Promise<readonly CompteDeTest[]> =>
  (
    await prismaClient.user.findMany({
      where: { isFixture: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    })
  ).map((compte) => ({
    id: UtilisateurId(compte.id),
    nom: nomAffiche(identiteToDomain(compte)),
  }))
