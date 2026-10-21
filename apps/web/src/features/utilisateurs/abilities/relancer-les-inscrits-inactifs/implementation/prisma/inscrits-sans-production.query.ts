import {
  productionSelect,
  productionToDomain,
} from '@app/web/features/utilisateurs/db/production.transfer'
import { relanceToDomain } from '@app/web/features/utilisateurs/db/relance.transfer'
import {
  AdresseCourriel,
  aProduit,
  type CompteARelancer,
  Prenom,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const inscritsSansProduction = async (): Promise<
  readonly CompteARelancer[]
> => {
  const comptes = await prismaClient.user.findMany({
    where: {
      role: 'User',
      deleted: null,
      inscriptionValidee: { not: null },
      AND: [
        {
          OR: [
            { mediateur: { is: null } },
            {
              mediateur: {
                is: {
                  derniereCreationActivite: null,
                  derniereCreationBeneficiaire: null,
                },
              },
            },
          ],
        },
        {
          OR: [
            { coordinateur: { is: null } },
            { coordinateur: { is: { derniereCreationActivite: null } } },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      inscriptionValidee: true,
      onboardingStatus: true,
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
            estMediateur: compte.mediateur !== null,
            estCoordinateur: compte.coordinateur !== null,
            situation: {
              phase: 'Nouveau' as const,
              depuis: compte.inscriptionValidee,
              relance: relanceToDomain('Nouveau', compte.onboardingStatus),
              aProduit: aProduit(productionToDomain(compte)),
            },
          },
        ]
  })
}
