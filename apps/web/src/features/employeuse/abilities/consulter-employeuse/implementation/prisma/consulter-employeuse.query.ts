import { prismaClient } from '@app/web/prismaClient'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../db/employeuse.transfer'
import type { ConsulterEmployeuse } from '../../domain/consulter-employeuse'

export const consulterEmployeuse: ConsulterEmployeuse = async ({
  employeuseId,
}) => {
  const ligne = await prismaClient.structureAdministrativeMain.findFirst({
    // Une employeuse supprimée côté Entrepôt ne se consulte plus.
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

  return {
    employeuse: employeuseToDomain(ligne),
    // Les affectations dont la personne n'a pas de compte coop sont écartées :
    // elles appartiennent à d'autres produits de l'Entrepôt.
    personnesEmployees: ligne.affectationsEmploi.flatMap(({ personne }) =>
      personne.user
        ? [
            {
              utilisateurId: personne.user.id,
              prenom: personne.user.firstName,
              nom: personne.user.lastName,
              nomComplet: personne.user.name,
              courriel: personne.user.email,
            },
          ]
        : [],
    ),
  }
}
