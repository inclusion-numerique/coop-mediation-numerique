import { prismaClient } from '@/configuration/prisma/prisma-client'
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

export const inscriptionsInachevees = async (): Promise<
  readonly CompteARelancer[]
> => {
  const comptes = await prismaClient.user.findMany({
    where: { role: 'User', deleted: null, inscriptionValidee: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      created: true,
      onboardingStatus: true,
      suppressionAnnonceeLe: true,
      ...productionSelect,
    },
  })

  return comptes.flatMap((compte) => {
    const courriel = AdresseCourriel.safe(compte.email)
    return courriel === null
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
              phase: 'Inscription' as const,
              depuis: compte.created,
              relance: relanceToDomain('Inscription', compte.onboardingStatus),
              suppressionAnnoncee: compte.suppressionAnnonceeLe,
              aProduit: aProduit(productionToDomain(compte)),
            },
          },
        ]
  })
}
