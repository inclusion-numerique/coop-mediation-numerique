import { prismaClient } from '@app/web/prismaClient'

export const createTagEquipe =
  (coordinateurId: string) =>
  async ({ nom, description }: { nom: string; description?: string | null }) =>
    prismaClient.tag.create({
      data: {
        nom,
        description,
        coordinateur: { connect: { id: coordinateurId } },
        equipe: true,
      },
    })
