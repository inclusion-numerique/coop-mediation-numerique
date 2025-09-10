import { beneficiaireCommuneResidenceToPreviewBanData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation' // Todo: move file to beneficiaires feature
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchBeneficiaireSelect = {
  id: true,
  mediateurId: true,
  prenom: true,
  nom: true,
  anneeNaissance: true,
  trancheAge: true,
  commune: true,
  communeCodePostal: true,
  communeCodeInsee: true,
  creation: true,
  accompagnementsCount: true,
} satisfies Prisma.BeneficiaireSelect

export const queryBeneficiairesForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.BeneficiaireWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.BeneficiaireOrderByWithRelationInput[]
}) =>
  prismaClient.beneficiaire
    .findMany({
      where,
      take,
      skip,
      select: searchBeneficiaireSelect,
      orderBy: [
        ...(orderBy ?? []),
        {
          nom: 'asc',
        },
        {
          prenom: 'asc',
        },
      ],
    })
    .then((beneficiaires) =>
      beneficiaires.map(
        ({
          prenom,
          nom,
          communeCodeInsee,
          commune,
          communeCodePostal,
          ...rest
        }) =>
          ({
            prenom: prenom ?? '',
            nom: nom ?? '',
            communeResidence:
              beneficiaireCommuneResidenceToPreviewBanData({
                communeCodeInsee,
                commune,
                communeCodePostal,
              }) ?? null,
            ...rest,
          }) satisfies BeneficiaireData,
      ),
    )

export type BeneficiaireForList = Awaited<
  ReturnType<typeof queryBeneficiairesForList>
>[number]
