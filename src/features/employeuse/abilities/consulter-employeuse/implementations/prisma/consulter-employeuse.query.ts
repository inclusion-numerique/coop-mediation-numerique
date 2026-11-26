import { prismaClient } from '@/configuration/prisma'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../implementations/prisma/employeuse.transfer'
import type { ConsulterEmployeuse } from '../../domain/ports'

export const consulterEmployeuse: ConsulterEmployeuse = async ({
  employeuseId,
}) => {
  const ligne = await prismaClient.structureAdministrativeMain.findFirst({
    where: { id: employeuseId, deletedAt: null },
    select: {
      ...employeuseSelect,
      affectationsEmploi: {
        where: { estActive: true },
        select: {
          personne: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!ligne) return null

  const personnesEmployees = [
    ...new Map(
      ligne.affectationsEmploi.flatMap(({ personne }) =>
        personne.user
          ? [
              [
                personne.user.id,
                {
                  utilisateurId: personne.user.id,
                  prenom: personne.user.firstName,
                  nom: personne.user.lastName,
                  nomComplet: personne.user.name,
                  courriel: personne.user.email,
                },
              ] as const,
            ]
          : [],
      ),
    ).values(),
  ]

  return { employeuse: employeuseToDomain(ligne), personnesEmployees }
}
