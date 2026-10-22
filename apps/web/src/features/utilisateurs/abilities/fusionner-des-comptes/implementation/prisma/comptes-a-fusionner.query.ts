import {
  AdresseCourriel,
  RoleUtilisateur,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import {
  CibleFusionId,
  type CompteAFusionner,
  SourceFusionId,
} from '../../domain'

const lire = (id: string) =>
  prismaClient.user.findUnique({
    where: { id },
    select: { email: true, role: true, deleted: true },
  })

const versCompte = <Id>(
  id: Id,
  row: NonNullable<Awaited<ReturnType<typeof lire>>>,
): CompteAFusionner<Id> => ({
  id,
  courriel: AdresseCourriel(row.email),
  role: RoleUtilisateur(row.role),
  supprime: row.deleted !== null,
})

export const comptesAFusionner = async ({
  sourceId,
  cibleId,
}: {
  readonly sourceId: string
  readonly cibleId: string
}): Promise<{
  readonly source: CompteAFusionner<SourceFusionId> | null
  readonly cible: CompteAFusionner<CibleFusionId> | null
}> => {
  const source = SourceFusionId.safe(sourceId)
  const cible = CibleFusionId.safe(cibleId)

  const [sourceRow, cibleRow] = await Promise.all([
    source === null ? null : lire(source),
    cible === null ? null : lire(cible),
  ])

  return {
    source:
      source === null || sourceRow === null
        ? null
        : versCompte(source, sourceRow),
    cible:
      cible === null || cibleRow === null ? null : versCompte(cible, cibleRow),
  }
}
