import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  type ActiviteId,
  ActiviteIntrouvable,
  type MediateurId,
  type UtilisateurId,
} from '../../../../domain'
import { recalculerLesPremiersAccompagnements } from '../../../../implementations/prisma/premier-accompagnement.mutation'

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

export const supprimerUneActiviteDeMediation = async ({
  activiteId,
  mediateurId,
  auteurId,
  maintenant = new Date(),
}: {
  activiteId: ActiviteId
  mediateurId: MediateurId | null
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, ActiviteIntrouvable>> => {
  if (mediateurId === null) return failure(ActiviteIntrouvable())

  const activite = await prismaClient.activite.findFirst({
    where: { id: activiteId, mediateurId, suppression: null },
    select: { type: true },
  })

  if (activite === null) return failure(ActiviteIntrouvable())

  const participants = await participantsDe(activiteId)
  const anonymesOrphelins = participants
    .filter(
      ({ anonyme, autres_accompagnements }) =>
        anonyme && autres_accompagnements === 0,
    )
    .map(({ beneficiaire_id }) => beneficiaire_id)
  const suivis = participants
    .filter(({ anonyme }) => !anonyme)
    .map(({ beneficiaire_id }) => beneficiaire_id)

  await prismaClient.$transaction(async (transaction) => {
    await transaction.accompagnement.deleteMany({ where: { activiteId } })
    await transaction.activitesTags.deleteMany({ where: { activiteId } })
    await transaction.beneficiaire.deleteMany({
      where: { id: { in: anonymesOrphelins }, anonyme: true },
    })
    await transaction.activite.update({
      where: { id: activiteId },
      data: { suppression: maintenant, modification: maintenant, rdvId: null },
    })
    await recalculerLesPremiersAccompagnements(transaction, suivis)
  })

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerActivite',
    data: { type: activite.type, id: activiteId },
  })

  return success(undefined)
}
