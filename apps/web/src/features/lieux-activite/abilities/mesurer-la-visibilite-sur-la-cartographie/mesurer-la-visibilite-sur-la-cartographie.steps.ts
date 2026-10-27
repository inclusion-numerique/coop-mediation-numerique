import assert from 'node:assert'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { MediateurId } from '../../domain/mediateur-id'
import type { VisibiliteSurLaCartographie } from './domain'
import { visibiliteSurLaCartographie } from './implementation'

const ROCHEFORT = '17299'
const CHARENTE_MARITIME = '17'

const lieuxSemes = new Set<string>()
const utilisateursSemes = new Set<string>()

const mesure: {
  mediateurId?: string
  avant?: VisibiliteSurLaCartographie
  apres?: VisibiliteSurLaCartographie
} = {}

const semerUnLieu = async (visible: boolean): Promise<string> => {
  const { id } = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Lieu ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: ROCHEFORT,
      banId: `${ROCHEFORT}_0123_00012`,
      visiblePourCartographieNationale: visible,
    },
    select: { id: true },
  })
  lieuxSemes.add(id)
  return id
}

const semerUnMediateurDansUnLieu = async (visible: boolean) => {
  const user = await prismaClient.user.create({
    data: { email: `cartographie-${v4()}@example.com` },
    select: { id: true },
  })
  utilisateursSemes.add(user.id)
  const mediateur = await prismaClient.mediateur.create({
    data: { userId: user.id },
    select: { id: true },
  })
  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: await semerUnLieu(visible),
      debut: new Date('2026-01-01'),
    },
  })
  mesure.mediateurId = mediateur.id
}

const mesurer = () =>
  visibiliteSurLaCartographie({
    mediateurId:
      mesure.mediateurId === undefined ? null : MediateurId(mesure.mediateurId),
    employeuse: null,
  })

Given(
  'un médiateur qui exerce dans un lieu visible de Charente-Maritime',
  async () => {
    await semerUnMediateurDansUnLieu(true)
  },
)

Given(
  'un médiateur qui exerce dans un lieu non visible de Charente-Maritime',
  async () => {
    await semerUnMediateurDansUnLieu(false)
  },
)

Given('sa visibilité sur la cartographie mesurée', async () => {
  mesure.avant = await mesurer()
})

Given('un nouveau lieu visible en Charente-Maritime', async () => {
  await semerUnLieu(true)
})

When('on mesure sa visibilité sur la cartographie', async () => {
  mesure.apres = await mesurer()
})

Then('{int} de ses lieux est visible', (attendu: number) => {
  assert.strictEqual(mesure.apres?.lieuxVisiblesDuMediateur, attendu)
})

Then('son département de référence est la Charente-Maritime', () => {
  assert.strictEqual(mesure.apres?.departement, CHARENTE_MARITIME)
})

Then('son département compte {int} lieu de plus', (attendu: number) => {
  assert.ok(mesure.avant && mesure.apres, 'Mesures manquantes')
  assert.strictEqual(
    mesure.apres.lieuxDuDepartement - mesure.avant.lieuxDuDepartement,
    attendu,
  )
})

After(async () => {
  const lieux = [...lieuxSemes]
  const utilisateurs = [...utilisateursSemes]
  lieuxSemes.clear()
  utilisateursSemes.clear()

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: { in: lieux } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: utilisateurs } },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: lieux } } })
  await prismaClient.user.deleteMany({ where: { id: { in: utilisateurs } } })
})
