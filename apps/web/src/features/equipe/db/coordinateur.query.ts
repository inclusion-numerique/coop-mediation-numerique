import { prismaClient } from '@app/web/prismaClient'
import {
  type CoordinateurDeLEquipe,
  type CoordinateurId,
  Email,
  Nom,
  NomAffiche,
  nomAffiche,
  Prenom,
  Telephone,
} from '../domain'
import { lue } from './lue'

export const lireLeCoordinateur = async (
  coordinateurId: CoordinateurId,
): Promise<CoordinateurDeLEquipe | null> => {
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
  const email = Email.safe(user.email)

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
