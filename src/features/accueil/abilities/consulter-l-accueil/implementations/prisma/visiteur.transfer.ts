import type { Prisma } from '@/generated/prisma/client'
import {
  CoordinateurId,
  Email,
  MediateurId,
  NomComplet,
  Prenom,
  type Visiteur,
} from '../../domain'

export const visiteurSelect = {
  firstName: true,
  name: true,
  email: true,
  hasSeenOnboarding: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
} satisfies Prisma.UserSelect

type VisiteurEnBase = Prisma.UserGetPayload<{ select: typeof visiteurSelect }>

export const versVisiteur = (utilisateur: VisiteurEnBase): Visiteur => ({
  prenom: Prenom.safe(utilisateur.firstName ?? ''),
  nomComplet: NomComplet.safe(utilisateur.name ?? ''),
  email: Email(utilisateur.email),
  mediateurId:
    utilisateur.mediateur === null
      ? null
      : MediateurId(utilisateur.mediateur.id),
  coordinateurId:
    utilisateur.coordinateur === null
      ? null
      : CoordinateurId(utilisateur.coordinateur.id),
  presentationVue: utilisateur.hasSeenOnboarding !== null,
})
