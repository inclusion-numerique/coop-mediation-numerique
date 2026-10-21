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

const renseigne = <T>(
  constructeur: { safe: (valeur: string) => T | null },
  valeur: string | null,
): T | null => (valeur === null ? null : constructeur.safe(valeur))

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
          prenom: renseigne(Prenom, user.firstName),
          nom: renseigne(Nom, user.lastName),
          nomComplet: renseigne(NomAffiche, user.name),
          email,
        }),
        email,
        telephone: renseigne(Telephone, user.phone),
      }
}
