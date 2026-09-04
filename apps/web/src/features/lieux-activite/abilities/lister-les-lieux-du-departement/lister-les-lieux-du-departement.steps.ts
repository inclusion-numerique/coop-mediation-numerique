import assert from 'node:assert'
import { lieuxDuDepartement } from '@app/web/features/lieux-activite/abilities/lister-les-lieux-du-departement'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

/**
 * La base locale porte les données de production : chaque scénario sème ses
 * propres lieux sous un nom unique et ne juge que ceux-là.
 */
const semis: {
  ids: string[]
  publie?: string
  frequente?: string
  delaisse?: string
  ailleurs?: string
  mediateurId?: string
  userId?: string
  trouves?: string[]
} = { ids: [] }

const CODE_INSEE = '17299'
const CODE_INSEE_AILLEURS = '51454'

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

Given('le lieu publié est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: semis.publie },
    data: { suppression: new Date() },
  })
})

When('on liste les lieux de ce département', async () => {
  const { lieux } = await lieuxDuDepartement({
    departementCode: '17',
    searchParams: { lignes: '1000' },
  })

  semis.trouves = lieux
    .map(({ id }) => id)
    .filter((id) => semis.ids.includes(id))
})

const proposes = () => semis.trouves ?? []

Then('le lieu publié est proposé', () => {
  assert.ok(proposes().includes(semis.publie as string))
})

Then('le lieu fréquenté est proposé', () => {
  assert.ok(proposes().includes(semis.frequente as string))
})

Then('le lieu délaissé n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.delaisse as string))
})

Then('le lieu publié n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.publie as string))
})

Then('le lieu d’ailleurs n’est pas proposé', () => {
  assert.ok(!proposes().includes(semis.ailleurs as string))
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
  semis.trouves = undefined
})
