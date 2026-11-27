import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { TagId } from '@/features/tags/domain'
import { lireUnTagActif } from '@/features/tags/implementations/prisma/tag-actif.query'
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
import { supprimerUnTag } from './domain/supprimer-un-tag'
import { effacerUnTag } from './implementations/prisma/effacer-un-tag.mutation'

const supprimerEnBase = supprimerUnTag({
  lireUnTagActif,
  effacer: effacerUnTag,
})

const contexte: {
  proprietaire?: { mediateurId?: string; coordinateurId?: string }
  tagId?: string
  activiteId?: string
  activiteCoordinationId?: string
  issue?: Awaited<ReturnType<typeof supprimerEnBase>>
} = {}

const tagId = (): string => {
  assert.ok(contexte.tagId)
  return contexte.tagId
}

Given(
  'un médiateur dont le tag personnel est utilisé dans une activité',
  async () => {
    const { mediateurId } = await semerUnMediateur()
    contexte.proprietaire = { mediateurId }
    contexte.tagId = await semerUnTag({ mediateurId })
    contexte.activiteId = await semerUneActiviteTaguee({
      mediateurId,
      tagIds: [tagId()],
    })
  },
)

Given(
  "un coordinateur dont le tag d'équipe est utilisé dans une activité de coordination",
  async () => {
    const { coordinateurId } = await semerUnCoordinateur()
    contexte.proprietaire = { coordinateurId }
    contexte.tagId = await semerUnTag({ coordinateurId, equipe: true })
    contexte.activiteCoordinationId =
      await semerUneActiviteDeCoordinationTaguee({
        coordinateurId,
        tagIds: [tagId()],
      })
  },
)

Given('un tag national', async () => {
  contexte.tagId = await semerUnTag({})
})

When('ce médiateur supprime ce tag', async () => {
  assert.ok(contexte.proprietaire?.mediateurId)
  contexte.issue = await supprimerEnBase({
    tagId: TagId(tagId()),
    acteur: acteurMediateur({ mediateurId: contexte.proprietaire.mediateurId }),
  })
})

When('ce coordinateur supprime ce tag', async () => {
  assert.ok(contexte.proprietaire?.coordinateurId)
  contexte.issue = await supprimerEnBase({
    tagId: TagId(tagId()),
    acteur: acteurCoordinateur({
      coordinateurId: contexte.proprietaire.coordinateurId,
    }),
  })
})

When('un autre médiateur supprime ce tag', async () => {
  const { mediateurId } = await semerUnMediateur()
  contexte.issue = await supprimerEnBase({
    tagId: TagId(tagId()),
    acteur: acteurMediateur({ mediateurId }),
  })
})

When('un coordinateur supprime ce tag', async () => {
  const { coordinateurId } = await semerUnCoordinateur()
  contexte.issue = await supprimerEnBase({
    tagId: TagId(tagId()),
    acteur: acteurCoordinateur({ coordinateurId, departement: '69' }),
  })
})

Then('la suppression du tag réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la suppression du tag est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("ce tag n'existe plus", async () => {
  assert.strictEqual(await tagEnBase(tagId()), null)
})

Then('ce tag existe toujours', async () => {
  assert.notStrictEqual(await tagEnBase(tagId()), null)
})

Then("l'activité ne porte plus ce tag", async () => {
  assert.ok(contexte.activiteId)
  assert.deepStrictEqual(await tagsDeLActivite(contexte.activiteId), [])
})

Then("l'activité de coordination ne porte plus ce tag", async () => {
  assert.ok(contexte.activiteCoordinationId)
  assert.deepStrictEqual(
    await tagsDeLActiviteDeCoordination(contexte.activiteCoordinationId),
    [],
  )
})
