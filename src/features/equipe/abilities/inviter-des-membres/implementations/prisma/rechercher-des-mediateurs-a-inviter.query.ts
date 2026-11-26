import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import {
  type CoordinateurId,
  Courriel,
  MediateurId,
  Nom,
  NomAffiche,
  nomAffiche,
  Prenom,
  roleMembre,
} from '../../../../domain'
import { facultative } from '../../../../implementations/prisma/lue.transfer'
import type { MediateursAInviter } from '../../domain'

const NOMBRE_DE_PROPOSITIONS = 50

const motsDe = (recherche: string): readonly string[] =>
  recherche.split(/\s+/).filter((mot) => mot.length > 0)

const correspondA = (mot: string): Prisma.UserWhereInput => ({
  OR: [
    { firstName: { contains: mot, mode: 'insensitive' } },
    { lastName: { contains: mot, mode: 'insensitive' } },
    { email: { contains: mot, mode: 'insensitive' } },
  ],
})

export const rechercherDesMediateursAInviter = async ({
  coordinateurId,
  recherche,
}: {
  readonly coordinateurId: CoordinateurId
  readonly recherche: string
}): Promise<MediateursAInviter> => {
  const where = {
    coordinations: { none: { coordinateurId, suppression: null } },
    user: { deleted: null, AND: motsDe(recherche).map(correspondA) },
  } satisfies Prisma.MediateurWhereInput

  const [trouves, total] = await Promise.all([
    prismaClient.mediateur.findMany({
      where,
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            personneMain: {
              select: {
                conseillerNumeriqueEnPoste: { select: { personneId: true } },
              },
            },
          },
        },
      },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
      take: NOMBRE_DE_PROPOSITIONS,
    }),
    prismaClient.mediateur.count({ where }),
  ])

  return {
    mediateurs: trouves.map(({ id, user }) => {
      const email = Courriel(user.email)
      return {
        mediateurId: MediateurId(id),
        nom: nomAffiche({
          prenom: facultative(Prenom, user.firstName),
          nom: facultative(Nom, user.lastName),
          nomComplet: facultative(NomAffiche, user.name),
          email,
        }),
        email,
        role: roleMembre(user.personneMain?.conseillerNumeriqueEnPoste != null),
      }
    }),
    total,
  }
}
