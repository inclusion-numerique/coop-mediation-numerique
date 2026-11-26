import { prismaClient } from '@/configuration/prisma'
import { Telephone } from '@/libraries/telephone'
import {
  Courriel,
  type LireLeCoordinateur,
  Nom,
  NomAffiche,
  nomAffiche,
  Prenom,
} from '../../domain'
import { lue } from './lue.transfer'

export const lireLeCoordinateur: LireLeCoordinateur = async (
  coordinateurId,
) => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      user: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  })
  if (coordinateur === null) return null

  const { user } = coordinateur
  const email = Courriel.safe(user.email)

  return email === null
    ? null
    : {
        nom: nomAffiche({
          prenom: lue(Prenom, user.firstName),
          nom: lue(Nom, user.lastName),
          nomComplet: lue(NomAffiche, user.name),
          email,
        }),
        email,
        telephone: lue(Telephone, user.phone),
      }
}
