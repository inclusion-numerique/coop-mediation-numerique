import assert from 'node:assert'
import { type Acteur, type Tag, TagId } from '@app/web/features/tags/domain'
import {
  acteurMediateur,
  semerUnMediateur,
  semerUnTag,
} from '@app/web/features/tags/tags.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { lireLesTagsVisibles } from './implementation'

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
