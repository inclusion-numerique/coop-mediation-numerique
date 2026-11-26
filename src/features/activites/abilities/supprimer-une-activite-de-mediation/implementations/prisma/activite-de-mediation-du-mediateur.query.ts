import { prismaClient } from '@/configuration/prisma'
import {
  type ActiviteId,
  BeneficiaireId,
  TypeDActivite,
} from '../../../../domain'
import type { ActiviteDeMediationDuMediateur } from '../../domain'

type Participant = {
  readonly beneficiaire_id: string
  readonly anonyme: boolean
  readonly autres_accompagnements: number
}

const participantsDe = (activiteId: ActiviteId) =>
  prismaClient.$queryRaw<Participant[]>`
    SELECT
      accompagnement.beneficiaire_id,
      beneficiaire.anonyme,
      (
        SELECT COUNT(*)::int
        FROM accompagnements autre
        WHERE autre.beneficiaire_id = accompagnement.beneficiaire_id
          AND autre.activite_id <> ${activiteId}::uuid
      ) AS autres_accompagnements
    FROM accompagnements accompagnement
    INNER JOIN beneficiaires beneficiaire
      ON beneficiaire.id = accompagnement.beneficiaire_id
    WHERE accompagnement.activite_id = ${activiteId}::uuid
  `

export const activiteDeMediationDuMediateur: ActiviteDeMediationDuMediateur =
  async ({ id, mediateurId }) => {
    const activite = await prismaClient.activite.findFirst({
      where: { id, mediateurId, suppression: null },
      select: { type: true },
    })
    if (activite === null) return null

    return {
      id,
      type: TypeDActivite(activite.type),
      participants: (await participantsDe(id)).map(
        ({ beneficiaire_id, anonyme, autres_accompagnements }) => ({
          beneficiaireId: BeneficiaireId(beneficiaire_id),
          anonyme,
          autresAccompagnements: autres_accompagnements,
        }),
      ),
    }
  }
