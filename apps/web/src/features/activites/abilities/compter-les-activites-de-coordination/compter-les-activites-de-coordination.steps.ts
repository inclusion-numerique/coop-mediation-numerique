import assert from 'node:assert'
import {
  type ActivitesDeCoordination,
  CoordinateurId,
  compterLesActivitesDeCoordination,
} from '@app/web/features/activites/abilities/compter-les-activites-de-coordination'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let coordinateurs: readonly { userId: string; coordinateurId: string }[] = []
let resultat: ActivitesDeCoordination | undefined

const semerUnCoordinateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `coordination-${userId}@example.com` },
  })
  const { id: coordinateurId } = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })
  coordinateurs = [...coordinateurs, { userId, coordinateurId }]
  return coordinateurId
}

const coordinateurCompte = () => {
  const [premier] = coordinateurs
  if (!premier) throw new Error('Aucun coordinateur semé')
  return premier.coordinateurId
}

Given(
  'un coordinateur ayant enregistré des activités de coordination',
  async () => {
    const coordinateurId = await semerUnCoordinateur()
    await prismaClient.activiteCoordination.createMany({
      data: [
        { type: 'Animation' as const, date: new Date('2026-02-10') },
        { type: 'Animation' as const, date: new Date('2026-05-04') },
        { type: 'Evenement' as const, date: new Date('2026-06-30') },
      ].map((activite) => ({ ...activite, coordinateurId })),
    })
  },
)

Given('une activité de coordination supprimée', async () => {
  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId: coordinateurCompte(),
      type: 'Partenariat',
      date: new Date('2026-03-12'),
      suppression: new Date('2026-03-13'),
    },
  })
})

Given("une activité de coordination d'un autre coordinateur", async () => {
  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId: await semerUnCoordinateur(),
      type: 'Partenariat',
      date: new Date('2026-03-12'),
    },
  })
})

When('je compte ses activités de coordination', async () => {
  resultat = await compterLesActivitesDeCoordination({
    coordinateurId: CoordinateurId(coordinateurCompte()),
  })
})

Then(
  'le cumul compte {int} animations, {int} évènement et {int} partenariat',
  (animations: number, evenements: number, partenariats: number) => {
    assert.deepStrictEqual(
      resultat?.cumul.map(({ nombre }) => nombre),
      [animations, evenements, partenariats],
    )
  },
)

Then('les trimestres comptés sont {string}', (attendus: string) => {
  assert.strictEqual(
    resultat?.trimestres
      .map(({ trimestre }) => `${trimestre.annee}-${trimestre.rang}`)
      .join(', '),
    attendus,
  )
})

After(async () => {
  const semes = coordinateurs
  coordinateurs = []
  resultat = undefined
  if (semes.length === 0) return

  const coordinateurIds = semes.map(({ coordinateurId }) => coordinateurId)
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semes.map(({ userId }) => userId) } },
  })
})
