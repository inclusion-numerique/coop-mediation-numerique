import assert from 'node:assert'
import {
  comptesRendusSemes,
  semerComptesRendus,
} from '@app/web/features/activites/activites.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { activitesExposees } from './implementation'

const exposition: {
  saisieLe?: Date
  pages: readonly (readonly string[])[]
} = { pages: [] }

const saisieLe = (): Date => {
  assert.ok(exposition.saisieLe, 'Aucune activité semée')
  return exposition.saisieLe
}

const activitesSemees = async (): Promise<readonly string[]> =>
  (
    await prismaClient.activite.findMany({
      where: { mediateurId: comptesRendusSemes().mediateurId },
      select: { id: true },
    })
  ).map(({ id }) => id)

const lister = async (modifieDepuis: Date) => {
  const { activites } = await activitesExposees({
    criteres: { creeDepuis: undefined, modifieDepuis },
    take: 500,
    curseur: null,
  })
  exposition.pages = [activites.map(({ id }) => id)]
}

Given('des activités à exposer', async () => {
  exposition.saisieLe = new Date(Date.now() - 1000)
  await semerComptesRendus()
})

When("l'API liste les activités modifiées depuis leur saisie", async () => {
  await lister(saisieLe())
})

When("l'API liste les activités modifiées depuis demain", async () => {
  await lister(new Date(Date.now() + 24 * 60 * 60 * 1000))
})

When("l'API liste une activité par page depuis leur saisie", async () => {
  const criteres = { creeDepuis: undefined, modifieDepuis: saisieLe() }
  const premiere = await activitesExposees({
    criteres,
    take: 1,
    curseur: null,
  })
  const derniere = premiere.activites.at(-1)
  assert.ok(derniere, 'Première page vide')
  const suivante = await activitesExposees({
    criteres,
    take: 1,
    curseur: {
      modification: derniere.modification.toISOString(),
      id: derniere.id,
    },
  })
  exposition.pages = [premiere, suivante].map(({ activites }) =>
    activites.map(({ id }) => id),
  )
})

Then('ces activités sont exposées', async () => {
  const exposees = exposition.pages.flat()
  const semees = await activitesSemees()
  assert.ok(semees.every((id) => exposees.includes(id)))
})

Then("aucune de ces activités n'est exposée", async () => {
  const exposees = exposition.pages.flat()
  const semees = await activitesSemees()
  assert.ok(semees.every((id) => !exposees.includes(id)))
})

Then("la page suivante expose l'autre activité", async () => {
  const [premiere = [], suivante = []] = exposition.pages
  const semees = await activitesSemees()
  assert.deepStrictEqual(
    [...premiere, ...suivante].toSorted(),
    [...semees].toSorted(),
  )
})
