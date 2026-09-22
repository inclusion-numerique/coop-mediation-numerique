import assert from 'node:assert'
import {
  deposerLeReleve,
  lireLesLieux,
  type Reprise,
  rangerLesListes,
  reprendreLesDonnees,
  sansDepot,
  sansRangement,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const SERVICES_DESORDONNES = [
  'MaitriseDesOutilsNumeriquesDuQuotidien',
  'AideAuxDemarchesAdministratives',
] as const

const SERVICES_RANGES = [
  'AideAuxDemarchesAdministratives',
  'MaitriseDesOutilsNumeriquesDuQuotidien',
]

const semis: { lieuId?: string; modification?: Date; reprise?: Reprise } = {}

const lieuSeme = (): string => {
  if (semis.lieuId == null) throw new Error('Aucun lieu semé')

  return semis.lieuId
}

const reprise = (): Reprise => {
  if (semis.reprise == null) throw new Error('Aucune reprise menée')

  return semis.reprise
}

const semerUnLieuAReprendre = async (
  champs: Record<string, unknown>,
): Promise<void> => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu à reprendre ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      services: ['AideAuxDemarchesAdministratives'],
      ...champs,
    },
    select: { id: true, modification: true },
  })

  semis.lieuId = lieu.id
  semis.modification = lieu.modification
}

const lireLesLieuxDuScenario = async () =>
  (await lireLesLieux()).filter(({ id }) => id === lieuSeme())

const servicesDuLieu = async (): Promise<readonly string[]> =>
  (
    await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuSeme() },
      select: { services: true },
    })
  ).services

const servicesDuRegistre = async (): Promise<readonly string[]> =>
  (
    await prismaClient.lieuInclusionRegistreMain.findFirstOrThrow({
      where: { structureCoopId: lieuSeme() },
      select: { services: true },
    })
  ).services

const anomaliesDuLieu = () =>
  reprise().releve.anomalies.filter(({ lieuId }) => lieuId === lieuSeme())

Given('un lieu dont la voie est vide', async () => {
  await semerUnLieuAReprendre({ adresse: '' })
})

Given(
  'un lieu dont les horaires ne suivent pas le format OpenStreetMap',
  async () => {
    await semerUnLieuAReprendre({ horaires: 'tous les jours sauf le mardi' })
  },
)

Given('un lieu dont les services sont désordonnés', async () => {
  await semerUnLieuAReprendre({ services: [...SERVICES_DESORDONNES] })
})

Given(
  'il est inscrit au registre avec les mêmes services désordonnés',
  async () => {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Lieu à reprendre',
        structureCoopId: lieuSeme(),
        services: [...SERVICES_DESORDONNES],
      },
    })
  },
)

When('on reprend les données des lieux', async () => {
  semis.reprise = await reprendreLesDonnees({
    ports: {
      lireLesLieux: lireLesLieuxDuScenario,
      rangerLesListes,
      deposerLeReleve,
      journal: () => undefined,
    },
  })
})

When('on mesure les données des lieux sans rien reprendre', async () => {
  semis.reprise = await reprendreLesDonnees({
    ports: {
      lireLesLieux: lireLesLieuxDuScenario,
      rangerLesListes: sansRangement,
      deposerLeReleve: sansDepot,
      journal: () => undefined,
    },
  })
})

Then('le relevé compte ce lieu parmi les écartés', () => {
  assert.ok(
    anomaliesDuLieu().some(({ gravite }) => gravite === 'lieu-ecarte'),
    'le lieu devrait porter une anomalie bloquante',
  )
})

Then('le relevé ne compte pas ce lieu parmi les écartés', () => {
  assert.ok(
    anomaliesDuLieu().every(({ gravite }) => gravite !== 'lieu-ecarte'),
    'le lieu ne devrait porter aucune anomalie bloquante',
  )
})

Then('il porte le motif {string}', (motif: string) => {
  assert.ok(
    anomaliesDuLieu().some(({ code }) => code === motif),
    `motifs relevés : ${anomaliesDuLieu()
      .map(({ code }) => code)
      .join(', ')}`,
  )
})

Then('les services du lieu sont rangés', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), SERVICES_RANGES)
})

Then('les services du lieu sont restés en l’état', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), [...SERVICES_DESORDONNES])
})

Then('les services de son inscription au registre sont rangés', async () => {
  assert.deepStrictEqual(await servicesDuRegistre(), SERVICES_RANGES)
})

Then('la date de modification du lieu n’a pas bougé', async () => {
  const { modification } = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: lieuSeme() },
    select: { modification: true },
  })

  assert.deepStrictEqual(modification, semis.modification)
})

After(async () => {
  const lieuId = semis.lieuId

  semis.lieuId = undefined
  semis.modification = undefined
  semis.reprise = undefined

  if (lieuId == null) return

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
})
