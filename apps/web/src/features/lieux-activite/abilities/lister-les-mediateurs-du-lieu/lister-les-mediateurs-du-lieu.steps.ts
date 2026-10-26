import assert from 'node:assert'
import {
  listerLesMediateursDuLieu,
  type MediateurDuLieu,
} from '@app/web/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const etat: {
  lieuId?: string
  userIds: string[]
  mediateurId?: string
  rattachementId?: string
  trouves?: readonly MediateurDuLieu[]
} = { userIds: [] }

const semerUnCompte = async (): Promise<string> => {
  const userId = v4()
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `lieu-${userId}@example.com`,
      inscriptionValidee: new Date('2026-01-01'),
    },
  })
  etat.userIds.push(userId)
  return userId
}

const leMediateur = (): MediateurDuLieu => {
  const [mediateur] = etat.trouves ?? []
  if (mediateur === undefined) throw new Error('Aucun médiateur référencé')
  return mediateur
}

const leCompteDuMediateur = () => etat.userIds.at(0) ?? ''

Given('un lieu où exerce un médiateur', async () => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu ${v4()}`,
      adresse: '3 rue des Carmes',
      commune: 'Aurillac',
      codePostal: '15000',
      codeInsee: '15014',
    },
    select: { id: true },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId: await semerUnCompte() },
    select: { id: true },
  })
  const rattachement = await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: lieu.id,
      debut: new Date('2026-01-01'),
    },
    select: { id: true },
  })

  etat.lieuId = lieu.id
  etat.mediateurId = mediateur.id
  etat.rattachementId = rattachement.id
})

Given('l’activité du médiateur dans le lieu a pris fin', async () => {
  await prismaClient.mediateurEnActivite.update({
    where: { id: etat.rattachementId },
    data: { fin: new Date('2026-03-01') },
  })
})

Given('le compte du médiateur est supprimé', async () => {
  await prismaClient.user.update({
    where: { id: leCompteDuMediateur() },
    data: { deleted: new Date('2026-06-01') },
  })
})

Given('l’inscription du médiateur n’est pas validée', async () => {
  await prismaClient.user.update({
    where: { id: leCompteDuMediateur() },
    data: { inscriptionValidee: null },
  })
})

Given(
  'le médiateur a eu une activité dans le lieu le {word}',
  async (date: string) => {
    await prismaClient.activite.create({
      data: {
        mediateurId: etat.mediateurId ?? '',
        structureId: etat.lieuId,
        type: 'Individuel',
        typeLieu: 'LieuActivite',
        date: new Date(date),
        duree: 30,
        accompagnementsCount: 0,
      },
    })
  },
)

Given(
  'le médiateur est coordonné par un coordinateur sans structure employeuse',
  async () => {
    const coordinateur = await prismaClient.coordinateur.create({
      data: { userId: await semerUnCompte() },
      select: { id: true },
    })
    await prismaClient.mediateurCoordonne.create({
      data: {
        coordinateurId: coordinateur.id,
        mediateurId: etat.mediateurId ?? '',
      },
    })
  },
)

Given(
  'le médiateur est coordonné par un coordinateur dont l’inscription n’est pas validée',
  async () => {
    const userId = await semerUnCompte()
    await prismaClient.user.update({
      where: { id: userId },
      data: { inscriptionValidee: null },
    })
    const coordinateur = await prismaClient.coordinateur.create({
      data: { userId },
      select: { id: true },
    })
    await prismaClient.mediateurCoordonne.create({
      data: {
        coordinateurId: coordinateur.id,
        mediateurId: etat.mediateurId ?? '',
      },
    })
  },
)

When('on liste les médiateurs du lieu', async () => {
  etat.trouves = await listerLesMediateursDuLieu(LieuId(etat.lieuId ?? ''))
})

Then('le médiateur est référencé sur le lieu', () => {
  assert.strictEqual(leMediateur().mediateurId, etat.mediateurId)
})

Then('aucun médiateur n’est référencé sur le lieu', () => {
  assert.deepStrictEqual(etat.trouves, [])
})

Then('le médiateur n’est coordonné par personne', () => {
  assert.deepStrictEqual(leMediateur().coordinateurs, [])
})

Then('le médiateur n’a jamais eu d’activité dans le lieu', () => {
  assert.deepStrictEqual(leMediateur().derniereActiviteIci, { _tag: 'Jamais' })
})

Then(
  'la dernière activité du médiateur dans le lieu date du {word}',
  (date: string) => {
    assert.deepStrictEqual(leMediateur().derniereActiviteIci, {
      _tag: 'Le',
      date: new Date(date),
    })
  },
)

Then(
  'le médiateur est coordonné depuis le département {word}',
  (departement: string) => {
    assert.deepStrictEqual(
      leMediateur().coordinateurs.map(({ departement }) => departement),
      [departement],
    )
  },
)

After(async () => {
  const userIds = etat.userIds.splice(0)
  if (etat.mediateurId !== undefined) {
    await prismaClient.activite.deleteMany({
      where: { mediateurId: etat.mediateurId },
    })
  }
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { mediateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateur: { userId: { in: userIds } } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { userId: { in: userIds } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: userIds } } })
  if (etat.lieuId !== undefined) {
    await prismaClient.lieuInclusionRegistreMain.deleteMany({
      where: { structureCoopId: etat.lieuId },
    })
    await prismaClient.lieuInclusion.deleteMany({ where: { id: etat.lieuId } })
  }
  etat.lieuId = undefined
  etat.mediateurId = undefined
  etat.rattachementId = undefined
  etat.trouves = undefined
})
