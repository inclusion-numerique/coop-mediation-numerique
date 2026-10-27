import {
  productionSelect,
  productionToDomain,
} from '@app/web/features/utilisateurs/db/production.transfer'
import { relanceToDomain } from '@app/web/features/utilisateurs/db/relance.transfer'
import {
  AdresseCourriel,
  aProduit,
  type CompteARelancer,
  CoordinateurId,
  MediateurId,
  Prenom,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

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
