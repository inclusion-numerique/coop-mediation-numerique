import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { MediateurId } from '../../domain/index'
import {
  type OptionsDeFiltreDesActivites,
  optionsDeFiltreDesActivites,
} from './implementations/prisma/options-de-filtre-des-activites.query'
import { tagsLesPlusUtilisesDuPerimetre } from './implementations/prisma/tags-du-perimetre.query'

type Semis = {
  readonly userIds: readonly string[]
  readonly mediateurIds: readonly string[]
  readonly employeuseIds: readonly number[]
  readonly tags: Readonly<Record<string, string>>
}

const semisVide: Semis = {
  userIds: [],
  mediateurIds: [],
  employeuseIds: [],
  tags: {},
}

let semis: Semis = semisVide
let options: OptionsDeFiltreDesActivites | undefined
let tagsDuPerimetre: readonly { readonly nom: string }[] = []

const semerUnMediateur = async (): Promise<string> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `options-de-filtre-${userId}@example.com` },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  semis = {
    ...semis,
    userIds: [...semis.userIds, userId],
    mediateurIds: [...semis.mediateurIds, mediateurId],
  }
  return mediateurId
}

const mediateurCourant = async (): Promise<string> =>
  semis.mediateurIds[0] ?? (await semerUnMediateur())

const semerUneEmployeuse = async (nom: string): Promise<number> => {
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom },
    select: { id: true },
  })
  semis = { ...semis, employeuseIds: [...semis.employeuseIds, id] }
  return id
}

const semerUnTag = async (
  nom: string,
  mediateurId: string,
): Promise<string> => {
  const deja = semis.tags[nom]
  if (deja !== undefined) return deja
  const { id } = await prismaClient.tag.create({
    data: { nom, mediateurId },
    select: { id: true },
  })
  semis = { ...semis, tags: { ...semis.tags, [nom]: id } }
  return id
}

const semerUneActivite = async ({
  mediateurId,
  date,
  employeuse,
  tag,
  suppression = null,
}: {
  readonly mediateurId: string
  readonly date: string
  readonly employeuse: string
  readonly tag: string
  readonly suppression?: Date | null
}) => {
  const { id } = await prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'ADistance',
      date: new Date(date),
      duree: 60,
      structureEmployeuseMainId: await semerUneEmployeuse(employeuse),
      suppression,
    },
    select: { id: true },
  })
  await prismaClient.activitesTags.create({
    data: { activiteId: id, tagId: await semerUnTag(tag, mediateurId) },
  })
}

const semerUneActiviteV1 = async (date: string, suppression: Date | null) =>
  prismaClient.activite.create({
    data: {
      mediateurId: await mediateurCourant(),
      type: 'Individuel',
      typeLieu: 'ADistance',
      date: new Date(date),
      duree: 60,
      v1CraId: v4(),
      suppression,
    },
  })

const optionsLues = (): OptionsDeFiltreDesActivites => {
  if (options === undefined) throw new Error('Options non listées')
  return options
}

const jour = (date: Date | undefined): string =>
  date === undefined ? '' : date.toISOString().slice(0, 10)

Given(
  "le médiateur a une activité le {string} pour l'employeuse {string} taguée {string}",
  async (date: string, employeuse: string, tag: string) => {
    await semerUneActivite({
      mediateurId: await mediateurCourant(),
      date,
      employeuse,
      tag,
    })
  },
)

Given(
  "une activité supprimée du médiateur le {string} pour l'employeuse {string} taguée {string}",
  async (date: string, employeuse: string, tag: string) => {
    await semerUneActivite({
      mediateurId: await mediateurCourant(),
      date,
      employeuse,
      tag,
      suppression: new Date(),
    })
  },
)

Given(
  "un autre médiateur a une activité le {string} pour l'employeuse {string} taguée {string}",
  async (date: string, employeuse: string, tag: string) => {
    await mediateurCourant()
    await semerUneActivite({
      mediateurId: await semerUnMediateur(),
      date,
      employeuse,
      tag,
    })
  },
)

Given('le tag {string} a été supprimé', async (nom: string) => {
  await prismaClient.tag.update({
    where: { id: semis.tags[nom] ?? '' },
    data: { suppression: new Date() },
  })
})

Given(
  'le médiateur a une activité importée de la v1 le {string}',
  async (date: string) => {
    await semerUneActiviteV1(date, null)
  },
)

Given(
  'le médiateur a une activité importée de la v1 le {string}, supprimée depuis',
  async (date: string) => {
    await semerUneActiviteV1(date, new Date())
  },
)

When('je liste les options de filtre de mes activités', async () => {
  options = await optionsDeFiltreDesActivites({
    mediateurId: MediateurId(await mediateurCourant()),
  })
})

Then(
  'la période proposée va du {string} au {string}',
  (debut: string, fin: string) => {
    const { periodeCouverte } = optionsLues()
    assert.deepStrictEqual(
      [jour(periodeCouverte.first), jour(periodeCouverte.last)],
      [debut, fin],
    )
  },
)

Then('les employeuses proposées sont {string}', (attendues: string) => {
  assert.strictEqual(
    optionsLues()
      .employeuses.map(({ nom }) => nom)
      .join(', '),
    attendues,
  )
})

Then('les tags proposés sont {string}', (attendus: string) => {
  assert.strictEqual(
    optionsLues()
      .tags.map(({ nom }) => nom)
      .join(', '),
    attendus,
  )
})

When('je liste les tags les plus utilisés de mon périmètre', async () => {
  tagsDuPerimetre = await tagsLesPlusUtilisesDuPerimetre({
    type: 'Mediateur',
    mediateur: MediateurId(await mediateurCourant()),
  })
})

Then('les tags les plus utilisés sont {string}', (attendus: string) => {
  assert.strictEqual(tagsDuPerimetre.map(({ nom }) => nom).join(', '), attendus)
})

Then("aucun tag n'est proposé", () => {
  assert.deepStrictEqual(optionsLues().tags, [])
})

Then('le filtre de source est proposé', () => {
  assert.strictEqual(optionsLues().importsV1, true)
})

Then("le filtre de source n'est pas proposé", () => {
  assert.strictEqual(optionsLues().importsV1, false)
})

Then("le médiateur n'a aucune activité", () => {
  assert.strictEqual(optionsLues().aDesActivites, false)
})

After(async () => {
  const seme = semis
  semis = semisVide
  options = undefined
  if (seme.mediateurIds.length === 0) return
  const mediateurIds = [...seme.mediateurIds]
  await prismaClient.activitesTags.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.tag.deleteMany({
    where: { id: { in: Object.values(seme.tags) } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: [...seme.employeuseIds] } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...seme.userIds] } },
  })
})
