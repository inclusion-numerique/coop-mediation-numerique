import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { lieuxAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/implementations/prisma/lieux-a-fusionner.query'

const etat: {
  lieuId?: string
  suffixe?: string
  proposes?: readonly string[]
} = {}

Given('un lieu {string} à fusionner', async (nom: string) => {
  etat.suffixe = v4()
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `${nom} ${etat.suffixe}`,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
    },
    select: { id: true },
  })
  etat.lieuId = lieu.id
})

Given('ce lieu à fusionner est supprimé', async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: etat.lieuId ?? '' },
    data: { suppression: new Date() },
  })
})

When(
  "l'administration cherche {string} parmi les lieux à fusionner",
  async (recherche: string) => {
    const { structures } = await lieuxAFusionner(
      `${recherche} ${etat.suffixe ?? ''}`,
    )
    etat.proposes = structures.map(({ id }) => id)
  },
)

Then('la recherche propose ce lieu à fusionner', () => {
  assert.deepStrictEqual(etat.proposes, [etat.lieuId])
})

Then('la recherche ne propose pas ce lieu à fusionner', () => {
  assert.deepStrictEqual(etat.proposes, [])
})

After(async () => {
  const lieuId = etat.lieuId
  delete etat.lieuId
  delete etat.suffixe
  delete etat.proposes

  if (lieuId)
    await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
})
