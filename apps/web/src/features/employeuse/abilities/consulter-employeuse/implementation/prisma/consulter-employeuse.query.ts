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

  // Les affectations dont la personne n'a pas de compte coop sont écartées : elles appartiennent à
  // d'autres produits de l'Entrepôt.
  //
  // Et on dédoublonne par utilisateur : la question posée est « qui cette employeuse emploie-t-elle »,
  // or une même personne porte une affectation ACTIVE par source (`coop`, `idposte`,
  // `aidants-connect`). Parcourir les affectations la faisait donc apparaître autant de fois —
  // 1 392 employeuses de production sur 3 188 étaient concernées, jusqu'à 22 lignes en trop pour la
  // pire, et le compteur « Emplois (33) » en annonçait trois fois trop.
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
