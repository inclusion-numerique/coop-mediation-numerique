import assert from 'node:assert'
import { Page, PageSize, Sort } from '@arckit/resultset'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { lieuxDuDepartement } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/lieux-du-departement.query'
import { nombreDeLieuxDuDepartement } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/nombre-de-lieux-du-departement.query'

const semis: {
  ids: string[]
  publie?: string
  frequente?: string
  delaisse?: string
  ailleurs?: string
  autreCommune?: string
  mediateurId?: string
  userId?: string
  trouves?: string[]
  nombre?: number
  aPreciser?: string[]
} = { ids: [] }

const CODE_INSEE = '17299'
const CODE_INSEE_AILLEURS = '51454'
const CODE_INSEE_AUTRE_COMMUNE = '17300'

const semerUnLieu = async ({
  publie,
  codeInsee = CODE_INSEE,
}: {
  publie: boolean
  codeInsee?: string
}) => {
  const { id } = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu ${v4()}`,
      adresse: '1 rue de l’Annuaire',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee,
      banId: `${codeInsee}_0001_00001`,
      visiblePourCartographieNationale: publie,
    },
    select: { id: true },
  })

  semis.ids.push(id)

  return id
}

Given('trois lieux dans le même département', async () => {
  semis.publie = await semerUnLieu({ publie: true })
  semis.frequente = await semerUnLieu({ publie: false })
  semis.delaisse = await semerUnLieu({ publie: false })

  const user = await prismaClient.user.create({
    data: { email: `annuaire-${v4()}@example.com` },
    select: { id: true },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId: user.id },
    select: { id: true },
  })

  semis.userId = user.id
  semis.mediateurId = mediateur.id

  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: semis.frequente,
      debut: new Date('2026-01-01'),
    },
  })
})

Given('un quatrième lieu publié dans un autre département', async () => {
  semis.ailleurs = await semerUnLieu({
    publie: true,
    codeInsee: CODE_INSEE_AILLEURS,
  })
})

Given(
  'un quatrième lieu publié dans une autre commune du département',
  async () => {
    semis.autreCommune = await semerUnLieu({
      publie: true,
      codeInsee: CODE_INSEE_AUTRE_COMMUNE,
    })
  },
)

Given("le lieu fréquenté n'a pas d'adresse reconnue par la BAN", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.frequente ?? '' },
    data: { banId: null },
  })
})

Given('le lieu publié est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.publie ?? '' },
    data: { suppression: new Date() },
  })
})

const TOUS_LES_LIEUX = {
  recherche: '',
  communes: [],
  tri: Sort('nom', 'asc'),
  page: Page(1),
  pageSize: PageSize(1000),
} as const

const lister = async (communes?: readonly string[]) => {
  const { items: lieux } = await lieuxDuDepartement({
    departementCode: '17',
    criteres: { ...TOUS_LES_LIEUX, communes: communes ?? [] },
  })

  const semes = lieux.filter(({ id }) => semis.ids.includes(id))

  semis.trouves = semes.map(({ id }) => id)
  semis.aPreciser = semes
    .filter(({ adresseAPreciser }) => adresseAPreciser)
    .map(({ id }) => id)
}

When('on liste les lieux de ce département', async () => {
  await lister()
})

When(
  'on liste les lieux de ce département dans la commune des trois premiers',
  async () => {
    await lister([CODE_INSEE])
  },
)

When('on compte les lieux de ce département', async () => {
  semis.nombre = await nombreDeLieuxDuDepartement('17')
})

Then('le nombre de lieux est celui de l’annuaire du département', async () => {
  const { totalItems } = await lieuxDuDepartement({
    departementCode: '17',
    criteres: TOUS_LES_LIEUX,
  })
  assert.strictEqual(semis.nombre, totalItems)
})

const proposes = () => semis.trouves ?? []

Then('le lieu publié est proposé', () => {
  assert.ok(proposes().includes(semis.publie ?? ''))
})

Then('le lieu fréquenté est proposé', () => {
  assert.ok(proposes().includes(semis.frequente ?? ''))
})

Then('le lieu délaissé n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.delaisse ?? ''))
})

Then('le lieu publié n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.publie ?? ''))
})

Then('seul le lieu fréquenté est signalé avec une adresse à préciser', () => {
  assert.deepStrictEqual(semis.aPreciser, [semis.frequente])
})

Then('le lieu de l’autre commune n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.autreCommune ?? ''))
})

Then('le lieu d’ailleurs n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.ailleurs ?? ''))
})

After(async () => {
  if (semis.mediateurId) {
    await prismaClient.mediateurEnActivite.deleteMany({
      where: { mediateurId: semis.mediateurId },
    })
    await prismaClient.mediateur.deleteMany({
      where: { id: semis.mediateurId },
    })
  }
  if (semis.userId) {
    await prismaClient.user.deleteMany({ where: { id: semis.userId } })
  }
  if (semis.ids.length > 0) {
    await prismaClient.lieuInclusion.deleteMany({
      where: { id: { in: semis.ids } },
    })
  }
  semis.ids = []
  delete semis.trouves
  delete semis.nombre
})
