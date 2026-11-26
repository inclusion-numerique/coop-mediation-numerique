import { prismaClient } from '@/configuration/prisma'
import { failure, success } from '@/libraries/result'
import { EmployeuseId } from '../../../../domain/employeuse-id'
import { EmployeuseIndisponible } from '../../domain/errors'
import type { LireLesEmployeusesDuSiret } from '../../domain/ports'

export const lireLesEmployeusesDuSiret =
  (signaler: (erreur: unknown) => void): LireLesEmployeusesDuSiret =>
  async (siret) => {
    try {
      const lignes = await prismaClient.structureAdministrativeMain.findMany({
        where: { siret },
        select: {
          id: true,
          denominationAntenne: true,
          denominationSirene: true,
        },
        orderBy: { id: 'asc' },
      })

      return success(
        lignes.map(({ id, denominationAntenne, denominationSirene }) => ({
          id: EmployeuseId(id),
          denominationAntenne,
          denominationSirene,
        })),
      )
    } catch (erreur) {
      signaler(erreur)
      return failure(EmployeuseIndisponible())
    }
  }
