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
import { facultative } from './lue.transfer'

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
  const email = Courriel(user.email)

  return {
    nom: nomAffiche({
      prenom: facultative(Prenom, user.firstName),
      nom: facultative(Nom, user.lastName),
      nomComplet: facultative(NomAffiche, user.name),
      email,
    }),
    email,
    telephone: facultative(Telephone, user.phone),
  }
}
