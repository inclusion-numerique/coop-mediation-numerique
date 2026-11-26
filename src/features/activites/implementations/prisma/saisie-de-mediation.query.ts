import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import {
  type ActiviteDeMediationDuMediateur,
  ActiviteId,
  BeneficiaireId,
  IdentifiantCraV1,
  LieuActiviteId,
  type RendezVousDejaSaisi,
  type RendezVousDUnAutreMediateur,
  TypeDActivite,
} from '../../domain'

export const nouvelIdentifiantDActivite = (): ActiviteId => ActiviteId(v4())

const anonymesOrphelinsDe = (id: string) =>
  prismaClient.$queryRaw<{ id: string }[]>`
    SELECT accompagnement.beneficiaire_id AS id
    FROM accompagnements accompagnement
    INNER JOIN beneficiaires beneficiaire
      ON beneficiaire.id = accompagnement.beneficiaire_id
    WHERE accompagnement.activite_id = ${id}::uuid
      AND beneficiaire.anonyme = true
      AND NOT EXISTS (
        SELECT 1 FROM accompagnements autre
        WHERE autre.beneficiaire_id = accompagnement.beneficiaire_id
          AND autre.activite_id <> ${id}::uuid
      )
  `

export const activiteDeMediationDuMediateur: ActiviteDeMediationDuMediateur =
  async ({ id, mediateurId }) => {
    const activite = await prismaClient.activite.findFirst({
      where: { id, mediateurId, suppression: null },
      select: {
        type: true,
        structureId: true,
        creation: true,
        v1CraId: true,
        accompagnements: {
          select: {
            beneficiaire: { select: { id: true, anonyme: true } },
          },
        },
      },
    })
    if (activite === null) return null

    const orphelins = await anonymesOrphelinsDe(id)

    return {
      type: TypeDActivite(activite.type),
      creation: activite.creation,
      identifiantV1:
        activite.v1CraId === null ? null : IdentifiantCraV1(activite.v1CraId),
      precedente: {
        lieuActiviteId:
          activite.structureId === null
            ? null
            : LieuActiviteId(activite.structureId),
        suivis: activite.accompagnements
          .filter(({ beneficiaire }) => !beneficiaire.anonyme)
          .map(({ beneficiaire }) => BeneficiaireId(beneficiaire.id)),
        anonymesOrphelins: orphelins.map((orphelin) =>
          BeneficiaireId(orphelin.id),
        ),
      },
    }
  }

export const rendezVousDUnAutreMediateur: RendezVousDUnAutreMediateur = async ({
  rdvId,
  mediateurId,
}) =>
  (await prismaClient.rdv.count({
    where: {
      id: rdvId,
      rdvAccount: { user: { mediateur: { id: { not: mediateurId } } } },
    },
  })) > 0

export const rendezVousDejaSaisi: RendezVousDejaSaisi = async ({
  rdvId,
  activiteId,
}) =>
  (await prismaClient.activite.count({
    where: { rdvId, suppression: null, id: { not: activiteId } },
  })) > 0
