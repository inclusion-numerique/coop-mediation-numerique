import assert from 'node:assert'
import {
  deposerLeReleve,
  lireLesLieux,
  type Releve,
  reprendreLesDonneesDesLieux,
  sansDepot,
  sansTri,
  trierLesListes,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees-des-lieux'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import type { Service, ServiceMain } from '@prisma/client'
import { v4 } from 'uuid'

const SERVICES_DESORDONNES: readonly Service[] = [
  'MaitriseDesOutilsNumeriquesDuQuotidien',
  'AideAuxDemarchesAdministratives',
]

const SERVICES_TRIES: readonly Service[] = [
  'AideAuxDemarchesAdministratives',
  'MaitriseDesOutilsNumeriquesDuQuotidien',
]

const SERVICES_DESORDONNES_AU_REGISTRE: readonly ServiceMain[] = [
  'MaitriseDesOutilsNumeriquesDuQuotidien',
  'AideAuxDemarchesAdministratives',
]

const semis: { lieuId?: string; modification?: Date; releve?: Releve } = {}

const lieuSeme = (): string => {
  if (semis.lieuId == null) throw new Error('Aucun lieu semé')

  return semis.lieuId
}

const releve = (): Releve => {
  if (semis.releve == null) throw new Error('Aucune passe menée')

  return semis.releve
}

const semerUnLieu = async (services: readonly Service[]): Promise<void> => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu à trier ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      services: [...services],
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

Given('un lieu dont les services sont désordonnés', async () => {
  await semerUnLieu(SERVICES_DESORDONNES)
})

Given('un lieu dont les listes sont en ordre', async () => {
  await semerUnLieu(SERVICES_TRIES)
})

Given(
  'il est inscrit au registre avec les mêmes services désordonnés',
  async () => {
    await prismaClient.lieuInclusionRegistreMain.create({
      data: {
        nom: 'Lieu à trier',
        structureCoopId: lieuSeme(),
        services: [...SERVICES_DESORDONNES_AU_REGISTRE],
      },
    })
  },
)

When('on reprend les données des lieux', async () => {
  semis.releve = (
    await reprendreLesDonneesDesLieux({
      ports: {
        lireLesLieux: lireLesLieuxDuScenario,
        trierLesListes,
        deposerLeReleve,
        journal: () => undefined,
      },
    })
  ).releve
})

When('on relève les données des lieux sans les reprendre', async () => {
  semis.releve = (
    await reprendreLesDonneesDesLieux({
      ports: {
        lireLesLieux: lireLesLieuxDuScenario,
        trierLesListes: sansTri,
        deposerLeReleve: sansDepot,
        journal: () => undefined,
      },
    })
  ).releve
})

Then('le relevé compte ce lieu dans la colonne {string}', (colonne: string) => {
  assert.ok(
    releve().listesATrier.lieux.some(
      ({ lieuId, colonnes }) =>
        lieuId === lieuSeme() &&
        colonnes.some((relevee) => relevee === colonne),
    ),
    `colonnes relevées : ${releve()
      .listesATrier.lieux.flatMap(({ colonnes }) => colonnes)
      .join(', ')}`,
  )
})

Then('le relevé ne retient pas ce lieu', () => {
  assert.ok(
    releve().listesATrier.lieux.every(({ lieuId }) => lieuId !== lieuSeme()),
    'le lieu ne devrait rien avoir à trier',
  )
})

Then('les services du lieu sont triés', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), [...SERVICES_TRIES])
})

Then('les services du lieu sont restés en l’état', async () => {
  assert.deepStrictEqual(await servicesDuLieu(), [...SERVICES_DESORDONNES])
})

Then('les services de son inscription au registre sont triés', async () => {
  assert.deepStrictEqual(await servicesDuRegistre(), [...SERVICES_TRIES])
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
  semis.releve = undefined

  if (lieuId == null) return

  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
})
