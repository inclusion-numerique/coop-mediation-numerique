import {
  historiqueEmployeusesAffichage,
  personneEmployeuseSelect,
  personneToEmployeusesHistorique,
} from '@app/web/features/employeuse/server'
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
      personneMain: { select: personneEmployeuseSelect },
      usurpateur: true,
    },
  })
  if (!user) {
    return null
  }
  // Historique des employeuses : une entrée par structure d'affectation (active = en cours,
  // inactive = terminée), dates best-effort depuis le contrat. La personne est déjà chargée par la
  // requête ci-dessus, d'où la composition plutôt que l'ability autonome.
  const { personneMain, ...userSansPersonne } = user
  return {
    user: {
      ...userSansPersonne,
      emplois: historiqueEmployeusesAffichage(
        personneToEmployeusesHistorique(personneMain),
      ),
    },
  }
}

export type AdministrationUserPageData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationUserPageData>>
>
