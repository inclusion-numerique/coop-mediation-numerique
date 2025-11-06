import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationUserPageData = async ({ id }: { id: string }) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: {
        include: {
          conseillerNumerique: true,
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
              structure: true,
            },
          },
        },
      },
      coordinateur: {
        include: {
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
          structure: true,
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
  return { user }
}

export type AdministrationUserPageData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationUserPageData>>
>
