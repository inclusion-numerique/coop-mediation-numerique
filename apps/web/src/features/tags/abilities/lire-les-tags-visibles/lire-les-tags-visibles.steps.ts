import assert from 'node:assert'
import { type Acteur, type Tag, TagId } from '@app/web/features/tags/domain'
import {
  acteurMediateur,
  semerUnMediateur,
  semerUnTag,
} from '@app/web/features/tags/tags.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { lireLesTagsVisibles, lireTousLesTagsVisibles } from './implementation'

const contexte: {
  acteur?: Acteur
  choisis: readonly string[]
  lus?: readonly Tag[]
} = { choisis: [] }

Given(
  'un médiateur qui a choisi son tag {string}, le tag personnel {string} d’un autre médiateur et son tag supprimé {string}',
  async (sien: string, etranger: string, supprime: string) => {
    const [{ mediateurId }, autre] = await Promise.all([
      semerUnMediateur(),
      semerUnMediateur(),
    ])
    const [sienId, etrangerId, supprimeId] = await Promise.all([
      semerUnTag({ nom: sien, mediateurId }),
      semerUnTag({ nom: etranger, mediateurId: autre.mediateurId }),
      semerUnTag({ nom: supprime, mediateurId }),
    ])
    await prismaClient.tag.update({
      where: { id: supprimeId },
      data: { suppression: new Date() },
    })
    contexte.acteur = acteurMediateur({ mediateurId })
    contexte.choisis = [sienId, etrangerId, supprimeId]
  },
)

When('les tags choisis par ce médiateur sont relus', async () => {
  assert.ok(contexte.acteur)
  contexte.lus = await lireLesTagsVisibles({
    acteur: contexte.acteur,
    tagIds: contexte.choisis.map(TagId),
  })
})

Then('seul le tag {string} est lu', (nom: string) => {
  assert.deepStrictEqual(
    contexte.lus?.map((tag) => tag.nom),
    [nom],
  )
})

When('tous les tags visibles par ce médiateur sont lus', async () => {
  assert.ok(contexte.acteur)
  contexte.lus = await lireTousLesTagsVisibles({ acteur: contexte.acteur })
})

Then('le tag {string} est proposé', (nom: string) => {
  assert.ok(contexte.lus?.some((tag) => tag.nom === nom))
})

Then(
  'ni {string} ni {string} ne sont proposés',
  (premier: string, second: string) => {
    assert.ok(
      !contexte.lus?.some((tag) => tag.nom === premier || tag.nom === second),
    )
  },
)
