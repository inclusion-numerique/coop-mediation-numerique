import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '../../../../domain/utilisateur-id'
import {
  employeuseSelect,
  employeuseToDomain,
} from '../../../../implementations/prisma/employeuse.transfer'
import { CourrielDeLaPersonne } from '../../domain/courriel-de-la-personne'
import type { PersonneEmployee } from '../../domain/employeuse-consultee'
import { NomDeLaPersonne } from '../../domain/nom-de-la-personne'
import type { LireLEmployeuse } from '../../domain/ports'

type UtilisateurLu = {
  readonly id: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly name: string | null
  readonly email: string
}

const nomLu = (valeur: string | null): NomDeLaPersonne | null =>
  valeur === null ? null : NomDeLaPersonne.safe(valeur)

const personneLue = (user: UtilisateurLu | null): PersonneEmployee | null =>
  user === null
    ? null
    : {
        utilisateurId: UtilisateurId(user.id),
        prenom: nomLu(user.firstName),
        nom: nomLu(user.lastName),
        nomComplet: nomLu(user.name),
        courriel: CourrielDeLaPersonne.safe(user.email),
      }

export const lireLEmployeuse: LireLEmployeuse = async (employeuseId) => {
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

  return ligne === null
    ? null
    : {
        employeuse: employeuseToDomain(ligne),
        affectations: ligne.affectationsEmploi.map(({ personne }) => ({
          personne: personneLue(personne.user),
        })),
      }
}
