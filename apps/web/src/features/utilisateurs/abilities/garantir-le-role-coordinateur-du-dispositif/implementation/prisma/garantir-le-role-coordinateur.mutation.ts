import { prismaClient } from '@app/web/prismaClient'

export const garantirLeRoleCoordinateurDuDispositif = async (
  userId: string,
): Promise<{ cree: boolean }> => {
  const existant = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existant) return { cree: false }

  const [dispositif] = await prismaClient.$queryRaw<
    { doit_coordonner: boolean }[]
  >`
    SELECT (
      COALESCE(p.is_coordinateur, false)
      AND EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id AND a.source = 'idposte' AND a.est_active
      )
    ) AS doit_coordonner
    FROM main.personne p
    WHERE p.coop_id = ${userId}::uuid
    LIMIT 1`

  if (!dispositif?.doit_coordonner) return { cree: false }

  await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })

  return { cree: true }
}
