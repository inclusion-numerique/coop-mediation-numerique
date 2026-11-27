import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { type Acteur, TagId } from '@/features/tags/domain'
import {
  acteurCoordinateur,
  acteurMediateur,
  semerUnCoordinateur,
  semerUneActiviteDeCoordinationTaguee,
  semerUneActiviteTaguee,
  semerUnMediateur,
  semerUnTag,
  tagEnBase,
  tagsDeLActivite,
  tagsDeLActiviteDeCoordination,
} from '@/features/tags/tags.cucumber'
import { fusionnerUnTag } from './domain/fusionner-un-tag'
import { reporterLeTag } from './implementations/prisma/reporter-le-tag.mutation'
import { lireLesTagsDeLaFusion } from './implementations/prisma/tags-de-la-fusion.query'

const fusionnerEnBase = fusionnerUnTag({
  lireLesTags: lireLesTagsDeLaFusion,
  reporter: reporterLeTag,
})

const contexte: {
  acteur?: Acteur
  coordinateurId?: string
  sourceId?: string
  destinationId?: string
  activiteId?: string
  activiteCoordinationId?: string
  issue?: Awaited<ReturnType<typeof fusionnerEnBase>>
} = {}

const valeur = <T>(valeur: T | undefined): T => {
  assert.ok(valeur)
  return valeur
}

Given(
  'un médiateur dont le tag personnel est utilisé dans une activité à fusionner',
  async () => {
    const { mediateurId } = await semerUnMediateur()
    contexte.acteur = acteurMediateur({ mediateurId })
    contexte.sourceId = await semerUnTag({ mediateurId })
    contexte.activiteId = await semerUneActiviteTaguee({
      mediateurId,
      tagIds: [contexte.sourceId],
    })
  },
)

Given(
  "un coordinateur du {int} dont le tag d'équipe est utilisé dans une activité de coordination",
  async (departement: number) => {
    const { coordinateurId } = await semerUnCoordinateur()
    contexte.coordinateurId = coordinateurId
    contexte.acteur = acteurCoordinateur({
      coordinateurId,
      departement: String(departement),
    })
    contexte.sourceId = await semerUnTag({ coordinateurId, equipe: true })
    contexte.activiteCoordinationId =
      await semerUneActiviteDeCoordinationTaguee({
        coordinateurId,
        tagIds: [contexte.sourceId],
      })
  },
)

Given(
  'un coordinateur du {int} dont le tag départemental est à fusionner',
  async (departement: number) => {
    const { coordinateurId } = await semerUnCoordinateur()
    contexte.coordinateurId = coordinateurId
    contexte.acteur = acteurCoordinateur({
      coordinateurId,
      departement: String(departement),
    })
    contexte.sourceId = await semerUnTag({ departement: String(departement) })
  },
)

Given('un tag national de destination', async () => {
  contexte.destinationId = await semerUnTag({})
})

Given(
  'un tag départemental du {int} de destination',
  async (departement: number) => {
    contexte.destinationId = await semerUnTag({
      departement: String(departement),
    })
  },
)

Given('un tag personnel de ce coordinateur de destination', async () => {
  contexte.destinationId = await semerUnTag({
    coordinateurId: valeur(contexte.coordinateurId),
  })
})

When('ce médiateur fusionne son tag dans le tag de destination', async () => {
  contexte.issue = await fusionnerEnBase({
    acteur: valeur(contexte.acteur),
    sourceId: TagId(valeur(contexte.sourceId)),
    destinationId: TagId(valeur(contexte.destinationId)),
  })
})

When(
  'ce coordinateur fusionne son tag dans le tag de destination',
  async () => {
    contexte.issue = await fusionnerEnBase({
      acteur: valeur(contexte.acteur),
      sourceId: TagId(valeur(contexte.sourceId)),
      destinationId: TagId(valeur(contexte.destinationId)),
    })
  },
)

Then('la fusion du tag réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la fusion du tag est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("l'activité porte le tag de destination", async () => {
  assert.deepStrictEqual(await tagsDeLActivite(valeur(contexte.activiteId)), [
    contexte.destinationId,
  ])
})

Then("l'activité de coordination porte le tag de destination", async () => {
  assert.deepStrictEqual(
    await tagsDeLActiviteDeCoordination(
      valeur(contexte.activiteCoordinationId),
    ),
    [contexte.destinationId],
  )
})

Then("le tag fusionné n'existe plus", async () => {
  assert.strictEqual(await tagEnBase(valeur(contexte.sourceId)), null)
})

Then('le tag à fusionner existe toujours', async () => {
  assert.notStrictEqual(await tagEnBase(valeur(contexte.sourceId)), null)
})
