import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { apercevoirLaFusion } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/domain'
import { lieuxAApercevoir } from '@/features/lieux-activite/abilities/apercevoir-la-fusion/implementations/prisma/lieux-a-apercevoir.query'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import type { Service } from '@/generated/prisma/client'

const SERVICE_COMMUN: Service = 'AideAuxDemarchesAdministratives'

const semis: { absorbeId?: string; conserveId?: string } = {}

const apercu: {
  issue?: Awaited<ReturnType<ReturnType<typeof apercevoirLaFusion>>>
} = {}

const semerUnLieu = (nom: string, services: readonly Service[]) =>
  prismaClient.lieuInclusion.create({
    data: {
      nom: `${nom} ${v4()}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      services: [...services],
    },
    select: { id: true },
  })

Given('deux lieux qui annoncent un même service', async () => {
  const [absorbe, conserve] = await Promise.all([
    semerUnLieu('Cyberbase', [SERVICE_COMMUN]),
    semerUnLieu('Médiathèque', [
      SERVICE_COMMUN,
      'MaitriseDesOutilsNumeriquesDuQuotidien',
    ]),
  ])

  semis.absorbeId = absorbe.id
  semis.conserveId = conserve.id
})

When(
  "l'administration aperçoit la fusion du premier dans le second",
  async () => {
    apercu.issue = await apercevoirLaFusion({ lieuxAApercevoir })({
      source: LieuId.safe(semis.absorbeId ?? ''),
      cible: LieuId.safe(semis.conserveId ?? ''),
    })
  },
)

When(
  "l'administration aperçoit la fusion du premier dans un lieu introuvable",
  async () => {
    apercu.issue = await apercevoirLaFusion({ lieuxAApercevoir })({
      source: LieuId.safe(semis.absorbeId ?? ''),
      cible: LieuId(v4()),
    })
  },
)

Then("l'aperçu montre les deux lieux", () => {
  assert.ok(apercu.issue?.success, "L'aperçu aurait dû réussir")
  assert.deepStrictEqual(
    [apercu.issue.data.mergeSource.id, apercu.issue.data.mergeTarget.id],
    [semis.absorbeId, semis.conserveId],
  )
})

Then("l'aperçu relève ce service en commun", () => {
  assert.ok(apercu.issue?.success, "L'aperçu aurait dû réussir")
  assert.deepStrictEqual(apercu.issue.data.mergeCommon.services, [
    SERVICE_COMMUN,
  ])
})

Then("l'aperçu est refusé faute de lieu", () => {
  assert.deepStrictEqual(
    apercu.issue?.success === false ? apercu.issue.error._tag : null,
    'FusionIntrouvable',
  )
})

After(async () => {
  const ids = [semis.absorbeId, semis.conserveId].filter(
    (id): id is string => id != null,
  )
  delete semis.absorbeId
  delete semis.conserveId
  delete apercu.issue

  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
