import { prismaClient } from '@app/web/prismaClient'
import { rdvToDomain } from '../../../../db'
import type { Lieu } from '../../../../domain/lieu'
import type { Motif } from '../../../../domain/motif'
import { RdvId } from '../../../../domain/rdv-id'
import type { Usager } from '../../../../domain/usager'
import type {
  EtatConnuDuLot,
  PortéeSynchronisation,
  RdvsDejaImportes,
} from '../../domain/synchroniser-rdvs'

export const rdvsDejaImportes: RdvsDejaImportes = async ({
  compte,
  organisationIds,
}: PortéeSynchronisation) =>
  (
    await prismaClient.rdv.findMany({
      where: {
        rdvAccountId: compte.agentId,
        organisationId: organisationIds
          ? { in: [...organisationIds] }
          : undefined,
      },
      select: { id: true },
    })
  ).map(({ id }) => RdvId(id))

/**
 * Lit le lot de rendez-vous déjà connus, avec leur entourage. Motifs, lieux et
 * usagers en sont extraits plutôt que relus séparément : ils n'existent en base
 * que portés par un rendez-vous, et une seule requête suffit donc à savoir ce que
 * La Coop détient.
 */
export const etatConnuDuLot: EtatConnuDuLot = async ({
  rdvIds,
  organisationIds,
}) => {
  const rows = await prismaClient.rdv.findMany({
    where: {
      id: { in: [...rdvIds] },
      organisationId: organisationIds
        ? { in: [...organisationIds] }
        : undefined,
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
}
