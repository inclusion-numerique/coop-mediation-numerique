import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { DemandeurDeLExport } from '@/features/statistiques/abilities/exporter-mes-statistiques/domain/demandeur-de-l-export'
import { exporterMesStatistiques } from '@/features/statistiques/abilities/exporter-mes-statistiques/domain/exporter-mes-statistiques'
import { demandeurDeLExport } from '@/features/statistiques/abilities/exporter-mes-statistiques/implementations/session/demandeur-de-l-export.transfer'
import { MediateurId } from '@/features/statistiques/domain/mediateur-id'

const exporter = exporterMesStatistiques({
  preparerLExport: async (perimetre: DemandeurDeLExport) => perimetre,
})

const etat: {
  utilisateurs: readonly string[]
  demandeur?: string
  mediateurs: Readonly<Record<string, string>>
  resultat?: Awaited<ReturnType<typeof exporter>>
} = { utilisateurs: [], mediateurs: {} }

const semerUnCompte = async (): Promise<string> => {
  const userId = v4()
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `exporter-mes-statistiques-${userId}@example.com`,
    },
  })
  etat.utilisateurs = [...etat.utilisateurs, userId]
  return userId
}

const semerUnMediateur = async (
  qui: string,
): Promise<{ readonly userId: string; readonly mediateurId: string }> => {
  const userId = await semerUnCompte()
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  etat.mediateurs = { ...etat.mediateurs, [qui]: mediateurId }
  return { userId, mediateurId }
}

const compteDuDemandeur = async (userId: string) => {
  const { mediateur, coordinateur } = await prismaClient.user.findUniqueOrThrow(
    {
      where: { id: userId },
      select: {
        mediateur: { select: { id: true } },
        coordinateur: {
          select: {
            mediateursCoordonnes: {
              select: { mediateurId: true, suppression: true },
            },
          },
        },
      },
    },
  )
  return {
    mediateur,
    coordinateur:
      coordinateur === null
        ? null
        : {
            mediateursCoordonnes: coordinateur.mediateursCoordonnes.filter(
              ({ suppression }) => suppression === null,
            ),
            ancienMediateursCoordonnes:
              coordinateur.mediateursCoordonnes.filter(
                ({ suppression }) => suppression !== null,
              ),
          },
  }
}

Given('un médiateur', async () => {
  etat.demandeur = (await semerUnMediateur('lui-même')).userId
  await semerUnMediateur('un autre médiateur')
})

Given('un coordinateur', async () => {
  const userId = await semerUnCompte()
  const { id: coordinateurId } = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })
  const { mediateurId } = await semerUnMediateur('un médiateur coordonné')
  await prismaClient.mediateurCoordonne.create({
    data: { coordinateurId, mediateurId },
  })
  etat.demandeur = userId
})

Given('un compte ni médiateur ni coordinateur', async () => {
  etat.demandeur = await semerUnCompte()
})

const exporterPour = async (mediateursExportes: readonly MediateurId[]) => {
  assert.ok(etat.demandeur, "Aucun demandeur n'a été semé")
  const demandeur = demandeurDeLExport(await compteDuDemandeur(etat.demandeur))
  etat.resultat = await exporter({
    demandeur,
    perimetre: demandeur,
    mediateursExportes,
  })
}

When('il exporte les statistiques de {string}', async (qui: string) => {
  const mediateur = etat.mediateurs[qui]
  assert.ok(mediateur, `Médiateur non semé : ${qui}`)
  await exporterPour([MediateurId(mediateur)])
})

When('il exporte ses statistiques', async () => {
  await exporterPour([])
})

Then("l'export est préparé", () => {
  assert.strictEqual(etat.resultat?.success, true)
})

Then("l'export est refusé : {string}", (echec: string) => {
  assert.deepStrictEqual(etat.resultat, {
    success: false,
    error: { _tag: echec },
  })
})

After(async () => {
  const utilisateurs = etat.utilisateurs
  etat.utilisateurs = []
  etat.mediateurs = {}
  delete etat.demandeur
  delete etat.resultat
  if (utilisateurs.length === 0) return
  const proprietaires = { userId: { in: [...utilisateurs] } }
  await prismaClient.mediateurCoordonne.deleteMany({
    where: {
      OR: [{ mediateur: proprietaires }, { coordinateur: proprietaires }],
    },
  })
  await prismaClient.coordinateur.deleteMany({ where: proprietaires })
  await prismaClient.mediateur.deleteMany({ where: proprietaires })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...utilisateurs] } },
  })
})
