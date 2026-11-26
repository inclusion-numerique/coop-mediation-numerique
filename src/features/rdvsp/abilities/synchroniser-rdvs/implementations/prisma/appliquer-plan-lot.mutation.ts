import { prismaClient } from '@/configuration/prisma'
import type { Rdv } from '../../../../domain/rdv/rdv'
import {
  lieuFromDomain,
  motifFromDomain,
  usagerFromDomain,
} from '../../../../implementations/prisma/entourage.transfer'
import {
  participationFromDomain,
  rdvFromDomain,
} from '../../../../implementations/prisma/rdv.transfer'
import { tenter } from '../../../../implementations/prisma/tenter.adapter'
import type {
  AppliquerPlanLot,
  SupprimerMotifsOrphelins,
  SupprimerRdvs,
} from '../../domain/ports'

const traceJson = (brut: unknown) => JSON.parse(JSON.stringify(brut ?? {}))

const ecrireRdv = async (rdv: Rdv, brut: unknown) =>
  prismaClient.$transaction(async (transaction) => {
    const colonnes = { ...rdvFromDomain(rdv), rawData: traceJson(brut) }

    await transaction.rdv.upsert({
      where: { id: rdv.id },
      create: colonnes,
      update: colonnes,
    })

    await transaction.rdvParticipation.deleteMany({ where: { rdvId: rdv.id } })

    await transaction.rdvParticipation.createMany({
      data: rdv.participations.map((participation) => ({
        ...participationFromDomain(participation),
        rdvId: rdv.id,
      })),
    })
  })

export const appliquerPlanLot: AppliquerPlanLot = tenter(
  async ({ plan, bruts }) => {
    await prismaClient.rdvUser.createMany({
      data: plan.usagers.aCreer.map(usagerFromDomain),
      skipDuplicates: true,
    })

    await Promise.all(
      plan.usagers.aMettreAJour.map((usager) =>
        prismaClient.rdvUser.update({
          where: { id: usager.id },
          data: usagerFromDomain(usager),
        }),
      ),
    )

    await prismaClient.rdvLieu.createMany({
      data: plan.lieux.aCreer.map(lieuFromDomain),
      skipDuplicates: true,
    })

    await Promise.all(
      plan.lieux.aMettreAJour.map((lieu) =>
        prismaClient.rdvLieu.update({
          where: { id: lieu.id },
          data: lieuFromDomain(lieu),
        }),
      ),
    )

    await prismaClient.rdvMotif.createMany({
      data: plan.motifs.aCreer.map(motifFromDomain),
      skipDuplicates: true,
    })

    await Promise.all(
      plan.motifs.aMettreAJour.map((motif) =>
        prismaClient.rdvMotif.update({
          where: { id: motif.id },
          data: motifFromDomain(motif),
        }),
      ),
    )

    await [...plan.rdvs.aCreer, ...plan.rdvs.aMettreAJour].reduce(
      async (precedent, rdv) => {
        await precedent
        await ecrireRdv(rdv, bruts.get(rdv.id) ?? {})
      },
      Promise.resolve(),
    )
  },
)

export const supprimerRdvs: SupprimerRdvs = tenter(async (rdvIds) => {
  await prismaClient.rdv.deleteMany({ where: { id: { in: [...rdvIds] } } })
})

export const supprimerMotifsOrphelins: SupprimerMotifsOrphelins = tenter(
  async (organisationIds) => {
    const { count } = await prismaClient.rdvMotif.deleteMany({
      where: {
        rdvs: { none: {} },
        organisationId: { in: [...organisationIds] },
      },
    })

    return count
  },
)
