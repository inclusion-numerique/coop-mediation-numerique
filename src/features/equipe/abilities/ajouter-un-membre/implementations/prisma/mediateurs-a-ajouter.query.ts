import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import {
  CoordinateurId,
  Courriel,
  Nom,
  NomAffiche,
  nomAffiche,
  Prenom,
  UtilisateurId,
} from '../../../../domain'
import { facultative } from '../../../../implementations/prisma/lue.transfer'
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

  return trouves.map(({ user }) => {
    const email = Courriel(user.email)
    return {
      utilisateurId: UtilisateurId(user.id),
      nom: nomAffiche({
        prenom: facultative(Prenom, user.firstName),
        nom: facultative(Nom, user.lastName),
        nomComplet: facultative(NomAffiche, user.name),
        email,
      }),
      email,
    }
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
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      coordinateur: { select: { id: true } },
    },
  })

  if (coordinateur?.coordinateur == null) return null

  return {
    coordinateurId: CoordinateurId(coordinateur.coordinateur.id),
    utilisateurId: id,
    nom: nomAffiche({
      prenom: facultative(Prenom, coordinateur.firstName),
      nom: facultative(Nom, coordinateur.lastName),
      nomComplet: facultative(NomAffiche, coordinateur.name),
      email: Courriel(coordinateur.email),
    }),
  }
}
