import { prismaClient } from '@/configuration/prisma'
import { DenominationEmployeuse } from '../../../../domain/denomination-employeuse'
import { EmployeuseId } from '../../../../domain/employeuse-id'
import type { LireLesEmployeusesDuSiret } from '../../domain/ports'

const denominationLue = (denomination: string | null) =>
  DenominationEmployeuse.safe(denomination ?? '')

export const lireLesEmployeusesDuSiret: LireLesEmployeusesDuSiret = async (
  siret,
) => {
  const lignes = await prismaClient.structureAdministrativeMain.findMany({
    where: { siret },
    select: {
      id: true,
      denominationAntenne: true,
      denominationSirene: true,
    },
    orderBy: { id: 'asc' },
  })

  return lignes.map(({ id, denominationAntenne, denominationSirene }) => ({
    id: EmployeuseId(id),
    denominationAntenne: denominationLue(denominationAntenne),
    denominationSirene: denominationLue(denominationSirene),
  }))
}
