import { randomUUID } from 'node:crypto'
import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { partageDuProprietaire } from '../../../../implementations/prisma/partage-du-proprietaire.query'
import type { EnregistrerLeReglageDuPartage } from '../../domain/ports'

type Partage = ReturnType<typeof partageDuProprietaire>

const reactiverAvecUnNouveauLien = (partage: Partage) =>
  prismaClient.partageStatistiques.updateMany({
    where: { ...partage, deleted: { not: null } },
    data: { id: randomUUID(), deleted: null },
  })

const activer = async (partage: Partage) => {
  await reactiverAvecUnNouveauLien(partage)
  await prismaClient.partageStatistiques.upsert({
    where: partage,
    create: partage,
    update: {},
  })
}

const desactiver = (partage: Partage, desactiveLe: Date) =>
  prismaClient.partageStatistiques.updateMany({
    where: { ...partage, deleted: null },
    data: { deleted: desactiveLe },
  })

export const enregistrerLeReglageDuPartage: EnregistrerLeReglageDuPartage =
  async ({ proprietaire, actif, auteurId, regleLe }) => {
    const partage = partageDuProprietaire(proprietaire)
    await (actif ? activer(partage) : desactiver(partage, regleLe))

    addMutationLog({
      userId: auteurId,
      nom: 'ReglerPartageStatistiques',
      data: { ...partage, actif },
    })
  }
