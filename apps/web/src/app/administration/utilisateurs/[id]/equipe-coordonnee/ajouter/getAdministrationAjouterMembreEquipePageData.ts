import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationAjouterMembreEquipePageData = async ({
  id,
}: {
  id: string
}) => {
  const coordinateurUser = await prismaClient.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      coordinateur: {
        select: {
          id: true,
          mediateursCoordonnes: {
            select: {
              mediateur: {
                select: {
                  id: true,
                  userId: true,
                },
              },
            },
            where: {
              suppression: null,
            },
          },
        },
      },
    },
  })

  const coordinateur = coordinateurUser?.coordinateur
  if (!coordinateur) {
    return null
  }

  const userIdsInEquipe = coordinateur.mediateursCoordonnes.map(
    (mc) => mc.mediateur.userId,
  )

  return {
    coordinateurUser: { ...coordinateurUser, coordinateur }, // here for type safety
    userIdsInEquipe,
  }
}

export type AdministrationAjouterMembreEquipePageData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationAjouterMembreEquipePageData>>
>
