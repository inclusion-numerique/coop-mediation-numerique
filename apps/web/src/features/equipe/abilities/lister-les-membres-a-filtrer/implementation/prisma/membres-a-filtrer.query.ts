import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import type { CoordinateurId } from '../../../../domain/coordinateur-id'
import { Email } from '../../../../domain/email'
import { MediateurId } from '../../../../domain/mediateur-id'
import { Nom } from '../../../../domain/nom'
import { NomAffiche, nomAffiche } from '../../../../domain/nom-affiche'
import { Prenom } from '../../../../domain/prenom'
import {
  type MembreAFiltrer,
  type MembreLu,
  membresDansLOrdre,
} from '../../domain'

const colonnesDeLUtilisateur = {
  firstName: true,
  lastName: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect

type Utilisateur = {
  readonly firstName: string | null
  readonly lastName: string | null
  readonly name: string | null
  readonly email: string
}

const identiteDe = (id: string, utilisateur: Utilisateur) => {
  const prenom = Prenom.safe(utilisateur.firstName ?? '')
  const nomDeFamille = Nom.safe(utilisateur.lastName ?? '')
  const email = Email(utilisateur.email)
  return {
    membre: {
      mediateurId: MediateurId(id),
      nom: nomAffiche({
        prenom,
        nom: nomDeFamille,
        nomComplet: NomAffiche.safe(utilisateur.name ?? ''),
        email,
      }),
      email,
    },
    prenom,
    nomDeFamille,
  }
}

export const listerLesMembresAFiltrer = async ({
  coordinateurId,
  demandeur,
  membres,
}: {
  readonly coordinateurId: CoordinateurId
  readonly demandeur: MediateurId | null
  readonly membres: readonly MediateurId[]
}): Promise<readonly MembreAFiltrer[]> => {
  const [deLuiMeme, lus] = await Promise.all([
    demandeur === null
      ? null
      : prismaClient.mediateur.findUnique({
          where: { id: demandeur },
          select: { id: true, user: { select: colonnesDeLUtilisateur } },
        }),
    prismaClient.mediateur.findMany({
      where: { id: { in: [...membres] } },
      select: {
        id: true,
        user: { select: colonnesDeLUtilisateur },
        coordinations: {
          where: { coordinateurId },
          select: { suppression: true },
        },
      },
    }),
  ])
  return membresDansLOrdre(
    deLuiMeme === null ? null : identiteDe(deLuiMeme.id, deLuiMeme.user).membre,
    lus.map(
      ({ id, user, coordinations }): MembreLu => ({
        ...identiteDe(id, user),
        departs: coordinations.map(({ suppression }) => suppression),
      }),
    ),
  )
}
