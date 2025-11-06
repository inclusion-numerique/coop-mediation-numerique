import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationAjouterMembreEquipePageData = async ({
  id,
}: {
  id: string
}) => {
  const coordinateur = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      coordinateur: true,
    },
  })

  if (!coordinateur) {
    return null
  }

  return {
    coordinateur,
  }
}

export type AdministrationAjouterMembreEquipePageData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationAjouterMembreEquipePageData>>
>
