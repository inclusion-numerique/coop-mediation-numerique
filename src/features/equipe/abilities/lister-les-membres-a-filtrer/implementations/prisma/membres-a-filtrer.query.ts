import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { Courriel } from '../../../../domain/identite/courriel'
import { Nom } from '../../../../domain/identite/nom'
import { NomAffiche, nomAffiche } from '../../../../domain/identite/nom-affiche'
import { Prenom } from '../../../../domain/identite/prenom'
import { facultative } from '../../../../implementations/prisma/lue.transfer'
import type {
  LireLeDemandeur,
  LireLesMembresAFiltrer,
} from '../../domain/ports'

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
  const prenom = facultative(Prenom, utilisateur.firstName)
  const nomDeFamille = facultative(Nom, utilisateur.lastName)
  const email = Courriel(utilisateur.email)
  return {
    membre: {
      mediateurId: MediateurId(id),
      nom: nomAffiche({
        prenom,
        nom: nomDeFamille,
        nomComplet: facultative(NomAffiche, utilisateur.name),
        email,
      }),
      email,
    },
    prenom,
    nomDeFamille,
  }
}

export const lireLeDemandeur: LireLeDemandeur = async (mediateurId) => {
  const demandeur = await prismaClient.mediateur.findUnique({
    where: { id: mediateurId },
    select: { id: true, user: { select: colonnesDeLUtilisateur } },
  })
  return demandeur === null
    ? null
    : identiteDe(demandeur.id, demandeur.user).membre
}

export const lireLesMembresAFiltrer: LireLesMembresAFiltrer = async ({
  coordinateurId,
  membres,
}) => {
  const lus = await prismaClient.mediateur.findMany({
    where: { id: { in: [...membres] } },
    select: {
      id: true,
      user: { select: colonnesDeLUtilisateur },
      coordinations: {
        where: { coordinateurId },
        select: { suppression: true },
      },
    },
  })
  return lus.map(({ id, user, coordinations }) => ({
    ...identiteDe(id, user),
    departs: coordinations.map(({ suppression }) => suppression),
  }))
}
