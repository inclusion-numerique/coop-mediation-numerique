import { prismaClient } from '@app/web/prismaClient'
import {
  lieuFromDomain,
  motifFromDomain,
  participationFromDomain,
  rdvFromDomain,
  usagerFromDomain,
} from '../../../../db'
import type { Rdv } from '../../../../domain/rdv'
import type {
  AppliquerPlanLot,
  SupprimerRdvs,
} from '../../domain/synchroniser-rdvs'

/**
 * Un rendez-vous et ses participations forment un tout : les participations sont
 * remplacées, non fusionnées, parce que RDV Service Public fait autorité sur la
 * liste — un participant retiré chez eux doit disparaître ici.
 */
/**
 * `raw_data` n'accepte que du JSON. Le passage par une sérialisation le garantit
 * plutôt que de l'affirmer par un transtypage : ce qui n'est pas sérialisable ne
 * sera pas écrit, et rien ne fera échouer la synchronisation à cause d'une trace.
 */
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

/**
 * L'ordre est imposé par les clés étrangères : usagers, lieux et motifs
 * existent avant les rendez-vous qui les désignent.
 */
export const appliquerPlanLot: AppliquerPlanLot = async ({ plan, bruts }) => {
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

  // Séquentiel : deux rendez-vous d'un même lot peuvent partager un lieu ou un
  // motif tout juste créés, et leurs transactions se disputeraient les lignes.
  await [...plan.rdvs.aCreer, ...plan.rdvs.aMettreAJour].reduce(
    async (precedent, rdv) => {
      await precedent
      await ecrireRdv(rdv, bruts.get(rdv.id) ?? {})
    },
    Promise.resolve(),
  )
}

/** La suppression d'un rendez-vous emporte ses participations, en cascade. */
export const supprimerRdvs: SupprimerRdvs = async (rdvIds) => {
  await prismaClient.rdv.deleteMany({ where: { id: { in: [...rdvIds] } } })
}
