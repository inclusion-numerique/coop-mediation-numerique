import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import type { PorteeDeSynchronisation } from '../../../../domain/portee-de-synchronisation'
import type { Lieu } from '../../../../domain/rdv/lieu'
import type { Motif } from '../../../../domain/rdv/motif'
import type { Usager } from '../../../../domain/usager'
import { rdvToDomain } from '../../../../implementations/prisma/rdv.transfer'
import type { EtatConnuDuLot, RdvsDejaImportes } from '../../domain/ports'

const filtreDeLaPortee = (portee: PorteeDeSynchronisation) =>
  portee._tag === 'organisations'
    ? { organisationId: { in: [...portee.organisationIds] } }
    : {}

export const rdvsDejaImportes: RdvsDejaImportes = attraperEnEchecTechnique(
  async ({ compte, portee }) =>
    (
      await prismaClient.rdv.findMany({
        where: {
          rdvAccountId: compte.agentId,
          ...filtreDeLaPortee(portee),
        },
        select: { id: true },
      })
    ).map(({ id }) => RdvId(id)),
)

export const etatConnuDuLot: EtatConnuDuLot = attraperEnEchecTechnique(
  async ({ rdvIds, portee }) => {
    const rows = await prismaClient.rdv.findMany({
      where: {
        id: { in: [...rdvIds] },
        ...filtreDeLaPortee(portee),
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
