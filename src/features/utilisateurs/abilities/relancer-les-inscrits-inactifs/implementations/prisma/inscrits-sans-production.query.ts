import { prismaClient } from '@/configuration/prisma'
import {
  AdresseCourriel,
  aProduit,
  type CompteARelancer,
  CoordinateurId,
  MediateurId,
  Prenom,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  productionSelect,
  productionToDomain,
} from '@/features/utilisateurs/implementations/prisma/production.transfer'
import { relanceToDomain } from '@/features/utilisateurs/implementations/prisma/relance.transfer'

export const inscritsSansProduction = async (): Promise<
  readonly CompteARelancer[]
> => {
  const comptes = await prismaClient.user.findMany({
    where: {
      role: 'User',
      deleted: null,
      inscriptionValidee: { not: null },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      inscriptionValidee: true,
      onboardingStatus: true,
      suppressionAnnonceeLe: true,
      ...productionSelect,
    },
  })

  return comptes.flatMap((compte) => {
    const courriel = AdresseCourriel.safe(compte.email)
    return courriel === null || compte.inscriptionValidee === null
      ? []
      : [
          {
            utilisateurId: UtilisateurId(compte.id),
            courriel,
            prenom: Prenom.safe(compte.firstName ?? ''),
            rattachements: rattachements(
              compte.mediateur === null
                ? null
                : MediateurId(compte.mediateur.id),
              compte.coordinateur === null
                ? null
                : CoordinateurId(compte.coordinateur.id),
            ),
            situation: {
              phase: 'Nouveau' as const,
              depuis: compte.inscriptionValidee,
              relance: relanceToDomain('Nouveau', compte.onboardingStatus),
              suppressionAnnoncee: compte.suppressionAnnonceeLe,
              aProduit: aProduit(productionToDomain(compte)),
            },
          },
        ]
  })
}
