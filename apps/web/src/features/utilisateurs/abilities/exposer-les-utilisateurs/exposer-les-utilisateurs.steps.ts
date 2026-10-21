import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { criteresDExposition } from './domain'
import { utilisateursExposes } from './implementation'

const exposition: {
  utilisateurId?: string
  exposes: readonly string[]
} = { exposes: [] }

const utilisateurId = (): string => {
  assert.ok(exposition.utilisateurId, 'Aucun compte semé')
  return exposition.utilisateurId
}

const semer = async ({
  inscrit,
  supprime = false,
}: {
  inscrit: boolean
  supprime?: boolean
}) => {
  exposition.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Api',
    marqueur: `Api${v4().slice(0, 8)}`,
    creeLe: new Date(),
    inscritLe: inscrit ? new Date() : null,
    supprimeLe: supprime ? new Date() : null,
    mediateur: { derniereActivite: null, dernierBeneficiaire: null },
  })
}

const lister = async (filtre: { soft_deleted?: '0' | '1' }) => {
  const { utilisateurs } = await utilisateursExposes({
    criteres: criteresDExposition(filtre),
    take: 500,
    skip: undefined,
    cursor: null,
  })
  exposition.exposes = utilisateurs.map(({ id }) => id)
}

Given('un compte inscrit à exposer', async () => {
  await semer({ inscrit: true })
})

Given('une inscription en cours sans activité à exposer', async () => {
  await semer({ inscrit: false })
})

Given('une inscription en cours avec une activité à exposer', async () => {
  await semer({ inscrit: false })
  const { id: mediateurId } = await prismaClient.mediateur.findUniqueOrThrow({
    where: { userId: utilisateurId() },
    select: { id: true },
  })
  await prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      date: new Date('2026-06-01'),
      duree: 60,
      typeLieu: 'Autre',
      accompagnementsCount: 0,
    },
  })
})

Given('un compte inscrit puis supprimé à exposer', async () => {
  await semer({ inscrit: true, supprime: true })
})

When("l'API liste les utilisateurs", async () => {
  await lister({})
})

When("l'API liste les utilisateurs non supprimés", async () => {
  await lister({ soft_deleted: '0' })
})

Then('ce compte est exposé', () => {
  assert.ok(exposition.exposes.includes(utilisateurId()))
})

Then("ce compte n'est pas exposé", () => {
  assert.ok(!exposition.exposes.includes(utilisateurId()))
})
