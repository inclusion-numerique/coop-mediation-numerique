import {
  employeuseMainAdminSelect,
  employeuseMainToAdminStructure,
} from '@app/web/features/structures/main/employeuseLieuData'
import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationUserPageData = async ({ id }: { id: string }) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: {
        select: {
          id: true,
          derniereCreationActivite: true,
          creation: true,
          modification: true,
          beneficiairesCount: true,
          activitesCount: true,
          _count: {
            select: {
              enActivite: true,
              beneficiaires: {
                where: { anonyme: false },
              },
              coordinations: true,
            },
          },
          coordinations: {
            include: {
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
                },
              },
            },
          },
          enActivite: {
            include: {
              lieuInclusion: true,
            },
          },
        },
      },
      coordinateur: {
        select: {
          id: true,
          derniereCreationActivite: true,
          creation: true,
          modification: true,
          _count: {
            select: {
              mediateursCoordonnes: {
                where: { suppression: null },
              },
            },
          },
          mediateursCoordonnes: {
            include: {
              mediateur: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      deleted: true,
                      role: true,
                      created: true,
                      inscriptionValidee: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              creation: 'desc',
            },
          },
          invitations: {
            include: {
              coordinateur: true,
              mediateurInvite: {
                include: {
                  user: {
                    select: {
                      name: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      deleted: true,
                      role: true,
                      created: true,
                      inscriptionValidee: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              creation: 'desc',
            },
          },
        },
      },
      accounts: true,
      sessions: true,
      uploads: true,
      mutations: true,
      emplois: {
        include: {
          structureMain: {
            select: employeuseMainAdminSelect,
          },
        },
        orderBy: {
          creation: 'desc',
        },
      },
      usurpateur: true,
    },
  })
  if (!user) {
    return null
  }
  // La structure employeuse affichée provient de `main` (source de vérité, ADR-002 étape 6),
  // réexposée sous `emploi.structure` (forme `getStructuresInfos`) pour laisser les pages admin
  // inchangées. `structureId` (uuid coop) reste porté par l'emploi pour le lien de route.
  return {
    user: {
      ...user,
      emplois: user.emplois.map(({ structureMain, ...emploi }) => ({
        ...emploi,
        structure: employeuseMainToAdminStructure(
          emploi.structureId,
          structureMain,
        ),
      })),
    },
  }
}

export type AdministrationUserPageData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationUserPageData>>
>
