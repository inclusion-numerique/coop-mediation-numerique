import assert from 'node:assert'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { CoordinateurId, criteresDesActivites, MediateurId } from '../../domain'
import type { Demandeur, ExportDesAccompagnements } from './domain'
import { exporterMesAccompagnements } from './implementation'

type Seme = { readonly userId: string; readonly mediateurId: string }

const contexte: {
  userIds: readonly string[]
  coordinateurIds: readonly string[]
  moi?: Seme
  autre?: Seme
  demandeur?: Demandeur
  exporte?: ExportDesAccompagnements
} = { userIds: [], coordinateurIds: [] }

const semerUnUtilisateur = async (): Promise<string> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `export-accompagnements-${userId}@example.com` },
  })
  contexte.userIds = [...contexte.userIds, userId]
  return userId
}

const semerUnMediateur = async (): Promise<Seme> => {
  const userId = await semerUnUtilisateur()
  const { id } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, mediateurId: id }
}

const semerUneActivite = (
  mediateurId: string,
  jour: number,
  participants: number,
) =>
  prismaClient.activite.create({
    data: {
      mediateurId,
      type: participants === 1 ? 'Individuel' : 'Collectif',
      typeLieu: 'ADistance',
      date: new Date(Date.UTC(2026, 2, jour)),
      duree: 60,
      thematiques: ['Email'],
      accompagnementsCount: participants,
      accompagnements: {
        create: Array.from({ length: participants }, () => ({
          beneficiaire: { create: { mediateurId, anonyme: true } },
        })),
      },
    },
    select: { id: true },
  })

const PARTICIPANTS_EN_MARS = { 3: 1, 5: 2, 9: 1 } as const

const demandeurMediateur = (seme: Seme): Demandeur => ({
  mediateurId: MediateurId(seme.mediateurId),
  coordinateurId: null,
  equipe: [],
})

const moi = (): Seme => {
  assert.ok(contexte.moi, 'Aucune médiatrice semée')
  return contexte.moi
}

Given(
  'une médiatrice ayant accompagné des bénéficiaires les 3, 5 et 9 mars 2026',
  async () => {
    contexte.moi = await semerUnMediateur()
    contexte.demandeur = demandeurMediateur(contexte.moi)
    await Promise.all(
      Object.entries(PARTICIPANTS_EN_MARS).map(([jour, participants]) =>
        semerUneActivite(moi().mediateurId, Number(jour), participants),
      ),
    )
  },
)

Given('son accompagnement du 9 mars 2026 est supprimé', async () => {
  await prismaClient.activite.updateMany({
    where: {
      mediateurId: moi().mediateurId,
      date: new Date(Date.UTC(2026, 2, 9)),
    },
    data: { suppression: new Date() },
  })
})

Given(
  'un autre médiateur a accompagné un bénéficiaire le 7 mars 2026',
  async () => {
    contexte.autre = await semerUnMediateur()
    await semerUneActivite(contexte.autre.mediateurId, 7, 1)
  },
)

Given(
  'un coordinateur dont un ancien membre a accompagné des bénéficiaires les 3 et 9 mars 2026, parti le 6 mars 2026',
  async () => {
    const membre = await semerUnMediateur()
    const coordinateurUserId = await semerUnUtilisateur()
    const { id: coordinateurId } = await prismaClient.coordinateur.create({
      data: { userId: coordinateurUserId },
      select: { id: true },
    })
    contexte.coordinateurIds = [...contexte.coordinateurIds, coordinateurId]
    await prismaClient.mediateurCoordonne.create({
      data: {
        coordinateurId,
        mediateurId: membre.mediateurId,
        suppression: new Date(Date.UTC(2026, 2, 6)),
      },
    })
    await Promise.all([
      semerUneActivite(membre.mediateurId, 3, 1),
      semerUneActivite(membre.mediateurId, 9, 1),
    ])
    contexte.demandeur = {
      mediateurId: null,
      coordinateurId: CoordinateurId(coordinateurId),
      equipe: [MediateurId(membre.mediateurId)],
    }
  },
)

Given(
  'une médiatrice ayant accompagné {int} bénéficiaires au même instant',
  async (nombre: number) => {
    contexte.moi = await semerUnMediateur()
    contexte.demandeur = demandeurMediateur(contexte.moi)
    const { mediateurId } = contexte.moi
    const instant = new Date(Date.UTC(2026, 3, 1, 10))
    const activites = Array.from({ length: nombre }, () => ({
      activiteId: v4(),
      beneficiaireId: v4(),
    }))
    await prismaClient.beneficiaire.createMany({
      data: activites.map(({ beneficiaireId }) => ({
        id: beneficiaireId,
        mediateurId,
        anonyme: true,
      })),
    })
    await prismaClient.activite.createMany({
      data: activites.map(({ activiteId }) => ({
        id: activiteId,
        mediateurId,
        type: 'Individuel' as const,
        typeLieu: 'ADistance' as const,
        date: instant,
        creation: instant,
        modification: instant,
        duree: 30,
        thematiques: ['Email' as const],
        accompagnementsCount: 1,
      })),
    })
    await prismaClient.accompagnement.createMany({
      data: activites.map(({ activiteId, beneficiaireId }) => ({
        activiteId,
        beneficiaireId,
      })),
    })
  },
)

const exporter = async (parametres: Record<string, string>) => {
  assert.ok(contexte.demandeur, 'Aucun demandeur semé')
  contexte.exporte = await exporterMesAccompagnements({
    demandeur: contexte.demandeur,
    criteres: criteresDesActivites(parametres),
    conseillersNumeriques: conseillerNumeriqueSql,
  })
}

When("j'exporte mes accompagnements", async () => {
  await exporter({})
})

When('le coordinateur exporte les accompagnements de son équipe', async () => {
  await exporter({})
})

When("j'exporte mes accompagnements avec {string}", async (requete: string) => {
  await exporter(Object.fromEntries(new URLSearchParams(requete)))
})

When("j'exporte mes accompagnements en filtrant sur moi-même", async () => {
  await exporter({ mediateurs: moi().mediateurId })
})

When(
  "j'exporte mes accompagnements en filtrant sur l'autre médiateur",
  async () => {
    assert.ok(contexte.autre, 'Aucun autre médiateur semé')
    await exporter({ mediateurs: contexte.autre.mediateurId })
  },
)

const exporte = (): ExportDesAccompagnements => {
  assert.ok(contexte.exporte, 'Aucun export')
  return contexte.exporte
}

const jourEnFrancais = (jour: string): string => {
  const date = new Date(`${jour}T00:00:00.000Z`)
  return `${date.getUTCDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(date)}`
}

Then("l'export contient les activités du {string}", (attendues: string) => {
  assert.strictEqual(
    exporte()
      .activites.map(({ date }) => jourEnFrancais(date))
      .join(', '),
    attendues,
  )
})

Then("l'export ne contient aucune activité", () => {
  assert.deepStrictEqual(exporte().activites, [])
})

Then("l'export compte {int} accompagnements", (attendu: number) => {
  assert.strictEqual(
    exporte().activites.flatMap(({ accompagnements }) => accompagnements)
      .length,
    attendu,
  )
})

Then("l'export contient {int} activités distinctes", (attendu: number) => {
  const ids = exporte().activites.map(({ id }) => id)
  assert.deepStrictEqual([ids.length, new Set(ids).size], [attendu, attendu])
})

Then("l'export est personnel", () => {
  assert.strictEqual(exporte().colonnes.personnel, true)
})

Then("l'export n'est pas personnel", () => {
  assert.strictEqual(exporte().colonnes.personnel, false)
})

Then("l'export affiche la source des données", () => {
  assert.strictEqual(exporte().colonnes.source, true)
})

After(async () => {
  const { userIds, coordinateurIds } = contexte
  contexte.userIds = []
  contexte.coordinateurIds = []
  contexte.moi = undefined
  contexte.autre = undefined
  contexte.demandeur = undefined
  contexte.exporte = undefined
  if (userIds.length === 0) return
  const mediateurIds = (
    await prismaClient.mediateur.findMany({
      where: { userId: { in: [...userIds] } },
      select: { id: true },
    })
  ).map(({ id }) => id)
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { coordinateurId: { in: [...coordinateurIds] } },
  })
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: [...coordinateurIds] } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: [...userIds] } } })
})
