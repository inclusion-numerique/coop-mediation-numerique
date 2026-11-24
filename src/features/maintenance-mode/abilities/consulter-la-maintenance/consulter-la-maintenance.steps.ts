import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { consulterLHistoriqueDesMaintenances } from '@/features/maintenance-mode/abilities/consulter-la-maintenance/implementations/prisma/historique-des-maintenances.query'
import type { PeriodeDeMaintenance } from '@/features/maintenance-mode/domain'

const auteurId = v4()

const consultation: { historique: readonly PeriodeDeMaintenance[] } = {
  historique: [],
}

After(async () => {
  consultation.historique = []
  await prismaClient.maintenance.deleteMany({ where: { createdBy: auteurId } })
})

Given(
  'une maintenance close avec le message {string}',
  async (message: string) => {
    await prismaClient.maintenance.create({
      data: {
        message,
        createdBy: auteurId,
        startedAt: new Date('2026-01-01T08:00:00.000Z'),
        endedAt: new Date('2026-01-01T10:00:00.000Z'),
      },
    })
  },
)

When("on consulte l'historique des maintenances", async () => {
  consultation.historique = await consulterLHistoriqueDesMaintenances()
})

Then(
  "l'historique liste {string} en cours, puis {string} close",
  (enCours: string, close: string) => {
    assert.deepStrictEqual(
      consultation.historique.map(({ message, fin }) => ({
        message,
        close: fin !== null,
      })),
      [
        { message: enCours, close: false },
        { message: close, close: true },
      ],
    )
  },
)
