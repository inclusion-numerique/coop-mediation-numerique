import { prismaClient } from '@app/web/prismaClient'

export const userFromShareId = async (id: string) =>
  prismaClient.partageStatistiques.findFirst({
    where: {
      id,
      deleted: null,
    },
    select: {
      mediateur: {
        select: {
          id: true,
          userId: true,
          creation: true,
          modification: true,
          isVisible: true,
          activitesCount: true,
          accompagnementsCount: true,
          beneficiairesCount: true,
          derniereCreationActivite: true,
          derniereCreationBeneficiaire: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              name: true,
              role: true,
            },
          },
          conseillerNumerique: {
            select: {
              id: true,
            },
          },
          coordinations: {
            select: {
              coordinateur: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  mediateursCoordonnes: {
                    select: {
                      id: true,
                      mediateurId: true,
                      suppression: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              activites: true,
              beneficiaires: true,
              enActivite: true,
            },
          },
        },
      },
      coordinateur: {
        select: {
          id: true,
          userId: true,
          creation: true,
          modification: true,
          derniereCreationActivite: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              name: true,
              role: true,
            },
          },
          conseillerNumeriqueId: true,
          mediateursCoordonnes: true,
        },
      },
    },
  })
