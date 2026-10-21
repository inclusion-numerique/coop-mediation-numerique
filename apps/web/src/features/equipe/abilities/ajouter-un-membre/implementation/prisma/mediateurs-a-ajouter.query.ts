import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { lue } from '../../../../db/lue'
import {
  CoordinateurId,
  Email,
  Nom,
  NomAffiche,
  nomAffiche,
  Prenom,
  UtilisateurId,
} from '../../../../domain'
import type { EquipeAComplementer, MediateurAAjouter } from '../../domain'

const LIMITE = 20

const correspondA = (mot: string): Prisma.UserWhereInput => ({
  OR: [
    { firstName: { contains: mot, mode: 'insensitive' } },
    { lastName: { contains: mot, mode: 'insensitive' } },
    { email: { contains: mot, mode: 'insensitive' } },
  ],
})

export const mediateursAAjouter = async ({
  coordinateurId,
  recherche,
}: {
  readonly coordinateurId: string
  readonly recherche: string
}): Promise<readonly MediateurAAjouter[]> => {
  const equipe = CoordinateurId.safe(coordinateurId)
  if (equipe === null) return []

  const trouves = await prismaClient.mediateur.findMany({
    where: {
      coordinations: { none: { coordinateurId: equipe, suppression: null } },
      user: {
        deleted: null,
        AND: recherche
          .split(/\s+/)
          .filter((mot) => mot !== '')
          .map(correspondA),
      },
    },
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
    orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
    take: LIMITE,
  })

  return trouves.flatMap(({ user }) => {
    const email = Email.safe(user.email)
    return email === null
      ? []
      : [
          {
            utilisateurId: UtilisateurId(user.id),
            nom: nomAffiche({
              prenom: lue(Prenom, user.firstName),
              nom: lue(Nom, user.lastName),
              nomComplet: lue(NomAffiche, user.name),
              email,
            }),
            email,
          },
        ]
  })
}

export const equipeAComplementer = async (
  utilisateurId: string,
): Promise<EquipeAComplementer | null> => {
  const id = UtilisateurId.safe(utilisateurId)
  if (id === null) return null

  const coordinateur = await prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      coordinateur: { select: { id: true } },
    },
  })

  return coordinateur?.coordinateur == null
    ? null
    : {
        coordinateurId: coordinateur.coordinateur.id,
        utilisateurId: coordinateur.id,
        nom: coordinateur.name ?? coordinateur.email,
      }
}
