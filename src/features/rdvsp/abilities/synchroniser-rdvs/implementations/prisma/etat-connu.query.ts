import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import type { Lieu } from '../../../../domain/rdv/lieu'
import type { Motif } from '../../../../domain/rdv/motif'
import type { Usager } from '../../../../domain/usager'
import { rdvToDomain } from '../../../../implementations/prisma/rdv.transfer'
import type { EtatConnuDuLot, RdvsDejaImportes } from '../../domain/ports'

export const rdvsDejaImportes: RdvsDejaImportes = attraperEnEchecTechnique(
  async ({ compte, organisationIds }) =>
    (
      await prismaClient.rdv.findMany({
        where: {
          rdvAccountId: compte.agentId,
          ...(organisationIds
            ? { organisationId: { in: [...organisationIds] } }
            : {}),
        },
        select: { id: true },
      })
    ).map(({ id }) => RdvId(id)),
)

export const etatConnuDuLot: EtatConnuDuLot = attraperEnEchecTechnique(
  async ({ rdvIds, organisationIds }) => {
    const rows = await prismaClient.rdv.findMany({
      where: {
        id: { in: [...rdvIds] },
        ...(organisationIds
          ? { organisationId: { in: [...organisationIds] } }
          : {}),
      },
      include: {
        motif: true,
        lieu: true,
        participations: { include: { user: true } },
      },
    })

    const rdvs = rows.map(rdvToDomain)

    return {
      rdvs: new Map(rdvs.map((rdv) => [rdv.id, rdv])),
      motifs: new Map(
        rdvs
          .map((rdv) => rdv.motif)
          .filter((motif): motif is Motif => motif !== null)
          .map((motif) => [motif.id, motif]),
      ),
      lieux: new Map(
        rdvs
          .map((rdv) => rdv.lieu)
          .filter((lieu): lieu is Lieu => lieu !== null)
          .map((lieu) => [lieu.id, lieu]),
      ),
      usagers: new Map(
        rdvs
          .flatMap((rdv) => rdv.participations)
          .map((participation): [Usager['id'], Usager] => [
            participation.usager.id,
            participation.usager,
          ]),
      ),
    }
  },
)
