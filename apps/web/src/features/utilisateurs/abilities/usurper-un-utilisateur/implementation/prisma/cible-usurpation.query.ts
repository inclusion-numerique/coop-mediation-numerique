import {
  CoordinateurId,
  MediateurId,
  nomAffiche,
  origineDuCompte,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import type { CibleUsurpation } from '../../domain'

export const cibleUsurpation = async (
  utilisateurId: string,
): Promise<CibleUsurpation | null> => {
  const id = UtilisateurId.safe(utilisateurId)
  if (id === null) return null

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
        nom: nomAffiche({
          prenom: row.firstName,
          nom: row.lastName,
          nomComplet: row.name,
          courriel: row.email,
        }),
        origine: origineDuCompte(row.isFixture),
        role: RoleUtilisateur(row.role),
        inscritLe: row.inscriptionValidee,
        rattachements: rattachements(
          row.mediateur === null ? null : MediateurId(row.mediateur.id),
          row.coordinateur === null
            ? null
            : CoordinateurId(row.coordinateur.id),
        ),
      }
}

export const comptesDeTest = async (): Promise<
  readonly { readonly id: string; readonly nom: string }[]
> =>
  (
    await prismaClient.user.findMany({
      where: { isFixture: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
  ).map(({ id, name, email }) => ({ id, nom: name ?? email }))
